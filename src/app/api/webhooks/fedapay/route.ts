import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // 1. Récupérer le corps brut de la requête (nécessaire pour la vérification de signature)
    const rawBody = await req.text();
    const signature = req.headers.get("x-fedapay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    }

    // 2. Vérifier la signature HMAC avec la clé secrète du webhook
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ Signature webhook invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    // 3. Traiter l'événement
    const event = JSON.parse(rawBody);
    const eventName = event.name;
    const transaction = event.data?.transaction;

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    // On récupère le numéro de commande depuis la description (ex: "Commande PM-20261018-1234 - PM Osons Oser")
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

      if (order && order.statut === "EN_ATTENTE") {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { statut: "PAYE" },
          include: { items: { include: { product: true } } },
        });

        // Envoyer les emails de confirmation
        try {
          await sendOrderConfirmationEmail(
            updatedOrder.customerEmail,
            updatedOrder.customerName,
            updatedOrder.orderNumber,
            updatedOrder.total,
            updatedOrder.items.map((i) => ({ name: i.product.name, quantity: i.quantity }))
          );
          await sendNewOrderAdminEmail(
            updatedOrder.orderNumber,
            updatedOrder.customerName,
            updatedOrder.total,
            process.env.EMAIL_USER!
          );
        } catch (emailError) {
          console.error("[WEBHOOK] Erreur email:", emailError);
        }

        // Revalider les pages pour afficher le nouveau statut
        revalidatePath("/admin/commandes");
        revalidatePath(`/compte/commandes/${order.id}`);
        revalidatePath(`/commande/${order.orderNumber}`);
      }
    }

    // 5. Gérer les échecs de paiement
    if (eventName === "transaction.declined") {
      console.log(`Paiement échoué pour la commande ${orderNumber}`);
      // Optionnel : envoyer un email au client pour l'informer de l'échec
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK FEDAPAY]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}