import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDeliveryFee } from "@/lib/delivery";

// Utilisation de l'API REST directe pour éviter les problèmes de SDK en environnement serverless
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 1. Récupérer la commande en base (sécurité : ne jamais faire confiance au montant du front)
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

    // 2. Créer la transaction chez FedaPay via l'API REST
    const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET_KEY;
    const isSandbox = FEDAPAY_SECRET?.startsWith("sk_sandbox");
    const baseUrl = isSandbox ? "https://sandbox-api.fedapay.com/v1" : "https://api.fedapay.com/v1";

    const fedapayRes = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FEDAPAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Commande ${order.orderNumber} - PM Osons Oser`,
        amount: Math.round(order.total), // Le montant doit être un entier
        currency: { iso: "XOF" },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/commande/${order.orderNumber}`,
        customer: {
          firstname: order.customerName.split(" ")[0] || "Client",
          lastname: order.customerName.split(" ").slice(1).join(" ") || "PM",
          email: order.customerEmail,
          phone_number: {
            number: order.telephone,
            country: "BJ", // Bénin
          },
        },
      }),
    });

    const fedapayData = await fedapayRes.json();

    if (!fedapayRes.ok) {
      console.error("Erreur FedaPay:", fedapayData);
      return NextResponse.json({ error: "Erreur lors de la création du paiement" }, { status: 500 });
    }

    const transactionId = fedapayData["v1/transaction"]?.id;

    // 3. Générer le token de paiement (l'URL vers laquelle rediriger le client)
    const tokenRes = await fetch(`${baseUrl}/transactions/${transactionId}/token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FEDAPAY_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenRes.json();
    const paymentUrl = tokenData.token;

    if (!paymentUrl) {
      return NextResponse.json({ error: "Erreur lors de la génération du lien de paiement" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, paymentUrl });
  } catch (error) {
    console.error("[FEDAPAY API]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}