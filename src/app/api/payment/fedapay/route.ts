import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 1. Récupérer la commande (sécurité)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (order.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Cette commande a déjà été traitée" }, { status: 400 });
    }

    // 2. Détection de l'environnement
    const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET_KEY;
    const isSandbox = FEDAPAY_SECRET?.startsWith("sk_sandbox");
    const baseUrl = isSandbox
      ? "https://sandbox-api.fedapay.com/v1"
      : "https://api.fedapay.com/v1";

    // 🛡️ NETTOYAGE DU TÉLÉPHONE : On ne garde que les chiffres et on retire le 229
    let cleanPhone = order.telephone.replace(/\D/g, "");
    if (cleanPhone.startsWith("229")) {
      cleanPhone = cleanPhone.substring(3);
    }

    // 🛡️ SÉCURITÉ LIVE : L'URL de callback doit être en HTTPS en production
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com";
    const callbackUrl = `${siteUrl}/commande/${order.orderNumber}`;

    // 3. Créer la transaction
    const fedapayRes = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FEDAPAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Commande ${order.orderNumber}`,
        amount: Math.round(order.total),
        currency: { iso: "XOF" },
        callback_url: callbackUrl,
        customer: {
          firstname: order.customerName.split(" ")[0] || "Client",
          lastname: order.customerName.split(" ").slice(1).join(" ") || "PM",
          email: order.customerEmail,
          phone_number: {
            number: cleanPhone,
            country: "bj", // Bénin
          },
        },
      }),
    });

    const fedapayData = await fedapayRes.json();

    if (!fedapayRes.ok) {
      console.error("🚨 Erreur création transaction FedaPay:", JSON.stringify(fedapayData, null, 2));
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement. Vérifiez vos clés API." },
        { status: 500 }
      );
    }

    const transactionId = fedapayData["v1/transaction"]?.id;

    if (!transactionId) {
      console.error("🚨 Réponse FedaPay sans ID de transaction:", fedapayData);
      return NextResponse.json(
        { error: "Impossible de récupérer l'ID de la transaction" },
        { status: 500 }
      );
    }

    // 4. Générer l'URL de paiement
    const tokenRes = await fetch(
      `${baseUrl}/transactions/${transactionId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FEDAPAY_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const tokenData = await tokenRes.json();

    // ⚠️ CRUCIAL : C'est 'url' qu'il faut utiliser, pas 'token'
    const paymentUrl = tokenData.url;

    if (!paymentUrl) {
      console.error("🚨 Réponse FedaPay token invalide:", tokenData);
      return NextResponse.json(
        { error: "Impossible de générer le lien de paiement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, paymentUrl });

  } catch (error) {
    console.error("[FEDAPAY API EXCEPTION]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}