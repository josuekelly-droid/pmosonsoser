import { NextResponse } from "next/server";
import { Webhook } from "fedapay";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-fedapay-signature");
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.warn("⚠️ Signature ou secret manquant");
      return NextResponse.json({ error: "Signature ou secret manquant" }, { status: 400 });
    }

    let event;

    try {
      event = Webhook.constructEvent(rawBody, signature, secret);
      console.log("✅ Signature webhook FedaPay vérifiée.");
    } catch (err) {
      console.error("🚨 Échec de la vérification de la signature:", err);
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }

    // ⚠️ CORRECTION ICI : Les données sont dans event.entity et non event.data.transaction
    const transaction = event.entity; 
    const eventName = event.name;

    if (!transaction) {
      console.warn("⚠️ Aucune donnée de transaction trouvée dans l'événement.");
      return NextResponse.json({ received: true });
    }

    console.log(`🔍 Événement reçu : ${eventName} pour la transaction ${transaction.id}`);

    // Extraire le numéro de commande depuis la description ("Commande PM-20261020-5785")
    const description = transaction.description || "";
    const orderNumberMatch = description.match(/PM-\d{8}-\d{4}/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;

    if (!orderNumber) {
      console.warn("Numéro de commande non trouvé dans la description:", description);
      return NextResponse.json({ received: true });
    }

    console.log(`🔍 Numéro de commande extrait : ${orderNumber}`);

    // Traitement du paiement approuvé
    if (eventName === "transaction.approved") {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        console.warn(`⚠️ Commande ${orderNumber} introuvable en base.`);
        return NextResponse.json({ received: true });
      }

      if (order.statut !== "EN_ATTENTE") {
        console.log(`ℹ️ Commande ${orderNumber} déjà traitée (statut: ${order.statut}).`);
        return NextResponse.json({ received: true });
      }

      // Mettre à jour la commande
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { statut: "PAYE" },
        include: { items: { include: { product: true } } },
      });

      console.log(`✅ Commande ${orderNumber} passée au statut PAYE.`);

      // Envoyer les emails
      try {
        await sendOrderConfirmationEmail(
          updatedOrder.customerEmail,
          updatedOrder.customerName,
          updatedOrder.orderNumber,
          updatedOrder.total,
          updatedOrder.items.map((i) => ({ name: i.product.name, quantity: i.quantity }))
        );
        if (process.env.EMAIL_USER) {
          await sendNewOrderAdminEmail(
            updatedOrder.orderNumber,
            updatedOrder.customerName,
            updatedOrder.total,
            process.env.EMAIL_USER
          );
        }
      } catch (emailError) {
        console.error("[WEBHOOK] Erreur email:", emailError);
      }

      // Rafraîchir les pages
      revalidatePath("/admin/commandes");
      revalidatePath(`/compte/commandes/${order.id}`);
      revalidatePath(`/commande/${order.orderNumber}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK FEDAPAY] Erreur inattendue:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}