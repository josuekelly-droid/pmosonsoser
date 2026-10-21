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

    // 1. Extraire le timestamp et la signature du header
    const parts = signature.split(",");
    let timestamp = "";
    let sigHash = "";

    parts.forEach((part) => {
      const [key, value] = part.split("=");
      if (key === "t") timestamp = value;
      if (key === "v1") sigHash = value;
    });

    if (!timestamp || !sigHash) {
      console.warn("⚠️ Format de signature invalide");
      return NextResponse.json({ error: "Format de signature invalide" }, { status: 400 });
    }

    // 2. Vérifier la signature (HMAC-SHA256)
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Comparaison sécurisée pour éviter les attaques temporelles
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(sigHash)
    );

    if (!isValid) {
      console.error("🚨 Signature invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    console.log("✅ Signature webhook FedaPay vérifiée.");

    // 3. Traiter l'événement
    const event = JSON.parse(rawBody);
    const transaction = event.entity; // ⚠️ Les données sont dans event.entity
    const eventName = event.name;

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    const description = transaction.description || "";
    const orderNumberMatch = description.match(/PM-\d{8}-\d{4}/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;

    if (!orderNumber) {
      console.warn("Numéro de commande non trouvé:", description);
      return NextResponse.json({ received: true });
    }

    if (eventName === "transaction.approved") {
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK FEDAPAY] Erreur inattendue:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}