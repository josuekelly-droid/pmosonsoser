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
      // Format timestampé (t=...,v1=...)
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
      // Format simple (juste un hash hexadécimal)
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
    
    // On ignore poliment les événements qui ne sont pas "approved" (ex: transaction.created)
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
      include: { items: { include: { product: true } } },
    });

    if (order && order.statut === "EN_ATTENTE") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { statut: "PAYE" },
        include: { items: { include: { product: true } } },
      });

      console.log(`✅ Commande ${orderNumber} passée au statut PAYE.`);

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