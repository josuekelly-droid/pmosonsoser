import { NextResponse } from "next/server";
import crypto from "crypto";
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

    // 1. Vérification de la signature (Sécurité prioritaire)
    let expectedSignature = "";
    let isValid = false;

    if (signature.includes("t=") && signature.includes("v1=")) {
      const parts = signature.split(",");
      let timestamp = "";
      let sigHash = "";
      parts.forEach((part) => {
        const [key, value] = part.split("=");
        if (key === "t") timestamp = value;
        if (key === "v1") sigHash = value;
      });

      if (timestamp && sigHash) {
        const signedPayload = `${timestamp}.${rawBody}`;
        expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(signedPayload)
          .digest("hex");
        isValid = expectedSignature === sigHash;
      }
    } else {
      expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      isValid = expectedSignature === signature;
    }

    if (!isValid) {
      console.warn("⚠️ Signature invalide reçue.");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    console.log("✅ Signature webhook FedaPay vérifiée.");

    // 2. Traitement de l'événement
    const event = JSON.parse(rawBody);
    const eventName = event.name;
    
    // On ignore les événements qui ne sont pas "approved"
    if (eventName !== "transaction.approved") {
      console.log(`ℹ️ Événement ignoré : ${eventName}`);
      return NextResponse.json({ received: true });
    }

    const transaction = event.entity;

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    const description = transaction.description || "";
    const orderNumberMatch = description.match(/PM-\d{8}-\d{4}/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;

    if (!orderNumber) {
      console.warn("Numéro de commande non trouvé dans la description:", description);
      return NextResponse.json({ received: true });
    }

    // 3. Mise à jour de la commande
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      // 🛡️ AJOUT DE brand: true
      include: { items: { include: { product: { include: { brand: true } } } } },
    });

    if (order && order.statut === "EN_ATTENTE") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { statut: "PAYE" },
        // 🛡️ AJOUT DE brand: true
        include: { items: { include: { product: { include: { brand: true } } } } },
      });

      console.log(`✅ Commande ${orderNumber} passée au statut PAYE.`);

      // 🎨 Calcul des totaux pour l'email détaillé
      const subtotal = updatedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);
      const deliveryFee = updatedOrder.total - subtotal;

      try {
        // Construction de l'objet complet pour le nouvel email détaillé
        const emailOrder = {
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.customerName,
          customerEmail: updatedOrder.customerEmail,
          telephone: updatedOrder.telephone,
          adresseLivraison: updatedOrder.adresseLivraison,
          notes: updatedOrder.notes,
          methodePaiement: updatedOrder.methodePaiement,
          total: updatedOrder.total,
          deliveryFee,
          subtotal,
          createdAt: updatedOrder.createdAt,
          items: updatedOrder.items.map((i) => ({
            productName: i.product.name,
            brandName: i.product.brand?.name,
            quantity: i.quantity,
            price: i.price,
            image: i.product.images?.[0],
            colorName: i.colorName,
            colorHex: i.colorHex,
          })),
        };

        // Envoi au client
        await sendOrderConfirmationEmail(emailOrder);

        // Envoi à l'admin
        if (process.env.EMAIL_USER) {
          await sendNewOrderAdminEmail(emailOrder, process.env.EMAIL_USER);
        }
      } catch (emailError) {
        console.error("[WEBHOOK] Erreur email:", emailError);
      }

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