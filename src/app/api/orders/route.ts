import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations/order";
import { calculateDeliveryFee } from "@/lib/delivery";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `PM-${ymd}-${rnd}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    /* ---------- 1. Parse + validation ---------- */
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    /* ---------- 2. Idempotence (anti double-clic) ---------- */
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      select: { orderNumber: true, total: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: true, orderNumber: existing.orderNumber, total: existing.total, reused: true },
        { status: 200 }
      );
    }

    /* ---------- 3. Transaction sécurisée ---------- */
    const order = await prisma.$transaction(async (tx) => {
      
      // 3a. Vérifier le statut B2B du client (si connecté)
      let isB2BValidated = false;
      if (session?.user?.id) {
        const dbUser = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { typeCompte: true, statutValidation: true }
        });
        
        // 🛡️ FIX : Parenthèses pour forcer l'évaluation (B2B OU PREMIUM) ET VALIDE
        if (
          (dbUser?.typeCompte === "B2B" || dbUser?.typeCompte === "PREMIUM") &&
          dbUser?.statutValidation === "VALIDE"
        ) {
          isB2BValidated = true;
        }
      }
      
      // 3b. Récupérer les vrais produits DANS la transaction
      const productIds = data.items.map((i) => i.id);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let subtotal = 0;
      const orderItemsToCreate = []; // On prépare les items avec le bon prix

      // 3c. Vérifier, calculer et décrémenter le stock
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.id)!;

        // 🛡️ FIX : Déterminer le prix unitaire une seule fois
        const unitPrice = (isB2BValidated && product.priceB2B) ? product.priceB2B : product.priceB2C;
        
        // 🛡️ FIX : Utiliser unitPrice pour le sous-total
        subtotal += unitPrice * item.quantity;

        // Décrémentation conditionnelle (atomique)
        const updated = await tx.product.updateMany({
          where: { 
            id: item.id, 
            stock: { gte: item.quantity }
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(`STOCK_INSUFFISANT:${product.name}`);
        }

        // 🛡️ FIX : Ajouter le bon prix dans les items de la commande
        orderItemsToCreate.push({
          productId: item.id,
          quantity: item.quantity,
          price: unitPrice, 
        });
      }

      // 3d. Calcul des frais de livraison
      const deliveryFee = calculateDeliveryFee(data.deliveryDistance, subtotal);
      const total = subtotal + deliveryFee;

      // 3e. Création de la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          idempotencyKey: data.idempotencyKey,
          userId: session?.user?.id || null, // 🛡️ FIX : Lier au client si connecté
          total,
          statut: "EN_ATTENTE",
          methodePaiement: data.methodePaiement,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          telephone: data.telephone,
          adresseLivraison: data.adresseLivraison,
          deliveryLat: data.deliveryLat,
          deliveryLng: data.deliveryLng,
          deliveryDistance: data.deliveryDistance,
          notes: data.notes || null,
          items: {
            create: orderItemsToCreate, // On insère les items avec le bon prix
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // 3f. Créer la notification Admin
      await tx.notification.create({
        data: {
          title: "Nouvelle commande",
          message: `${newOrder.customerName} a passé la commande ${newOrder.orderNumber} (${total} FCFA)`,
          type: "ORDER_NEW",
          link: `/admin/commandes/${newOrder.id}`,
        },
      });

      return newOrder;
    });

    /* ---------- 4. Envoi des emails (hors transaction) ---------- */
    try {
      await sendOrderConfirmationEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        order.total,
        order.items.map(i => ({ name: i.product.name, quantity: i.quantity }))
      );

      if (process.env.EMAIL_USER) {
        await sendNewOrderAdminEmail(
          order.orderNumber,
          order.customerName,
          order.total,
          process.env.EMAIL_USER
        );
      }
    } catch (emailError) {
      console.error("[orders] Erreur lors de l'envoi des emails:", emailError);
    }

    /* ---------- 5. Réponse succès ---------- */
    return NextResponse.json(
      { ok: true, orderNumber: order.orderNumber, total: order.total },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("[/api/orders POST]", error);

    if (error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Un ou plusieurs produits sont introuvables" }, { status: 400 });
    }
    if (error.message.startsWith("STOCK_INSUFFISANT:")) {
      const productName = error.message.split(":")[1];
      return NextResponse.json({ error: `Stock insuffisant pour ${productName}.` }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Erreur serveur, réessayez dans un instant" },
      { status: 500 }
    );
  }
}