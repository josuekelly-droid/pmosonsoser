import { NextResponse } from "next/server";
import { Webhook } from "fedapay"; // Import du SDK officiel
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // 1. Récupérer le corps brut de la requête (indispensable pour la vérification)
    const rawBody = await req.text();
    const signature = req.headers.get("x-fedapay-signature");
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.warn("⚠️ Signature ou secret webhook manquant.");
      return NextResponse.json({ error: "Signature ou secret manquant" }, { status: 400 });
    }

    let event;

    // 2. Vérifier la signature avec le SDK officiel
    try {
      // La méthode constructEvent vérifie la signature et parse l'événement
      event = Webhook.constructEvent(rawBody, signature, secret);
      console.log("✅ Signature webhook FedaPay vérifiée avec succès.");
    } catch (err) {
      console.error("🚨 Échec de la vérification de la signature:", err);
      // On renvoie une 400 pour que FedaPay sache que l'appel a échoué
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }

    // 3. Traiter l'événement
    const transaction = event.data?.transaction;
    const eventName = event.name;

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    // On récupère le numéro de commande depuis la description
    const description = transaction.description || "";
    const orderNumberMatch = description.match(/PM-\d{8}-\d{4}/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;

    if (!orderNumber) {
      console.warn("Numéro de commande non trouvé dans la description:", description);
      return NextResponse.json({ received: true });
    }

    // 4. Mettre à jour la commande si le paiement est approuvé
    if (eventName === "transaction.approved") {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      });

      // On vérifie que la commande existe et est toujours en attente pour éviter les doublons
      if (order && order.statut === "EN_ATTENTE") {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { statut: "PAYE" },
          include: { items: { include: { product: true } } },
        });

        console.log(`✅ Commande ${order.orderNumber} passée au statut PAYE.`);

        // Envoyer les emails de confirmation
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
          console.error("[WEBHOOK] Erreur lors de l'envoi des emails:", emailError);
        }

        // Rafraîchir les pages concernées pour afficher le nouveau statut
        revalidatePath("/admin/commandes");
        revalidatePath(`/compte/commandes/${order.id}`);
        revalidatePath(`/commande/${order.orderNumber}`);
      }
    }

    // 5. Gérer les échecs de paiement
    if (eventName === "transaction.declined") {
      console.log(`Paiement échoué pour la commande ${orderNumber}`);
      // Vous pouvez optionnellement notifier le client ici
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[WEBHOOK FEDAPAY] Erreur inattendue:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}