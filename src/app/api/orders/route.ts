import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
      select: { id: true, orderNumber: true, total: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: true, orderNumber: existing.orderNumber, orderId: existing.id, total: existing.total, reused: true },
        { status: 200 }
      );
    }

    /* ---------- 3. Transaction sécurisée ---------- */
    const result = await prisma.$transaction(async (tx) => {
      // 3a. Vérifier le statut B2B du client (si connecté)
      let isB2BValidated = false;
      if (session?.user?.id) {
        const dbUser = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { typeCompte: true, statutValidation: true },
        });

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
      const orderItemsToCreate: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

      // 3c. Vérifier, calculer et décrémenter le stock
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.id)!;

        const unitPrice =
          isB2BValidated && product.priceB2B ? product.priceB2B : product.priceB2C;
        subtotal += unitPrice * item.quantity;

        const updated = await tx.product.updateMany({
          where: { id: item.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(`STOCK_INSUFFISANT:${product.name}`);
        }

        orderItemsToCreate.push({
          productId: item.id,
          quantity: item.quantity,
          price: unitPrice,
          colorName: item.colorName || null,
          colorHex: item.colorHex || null,
        });
      }

      // 3d. Récupérer les settings de livraison + calcul des frais
      const settings = await tx.settings.findUnique({ where: { id: "global" } });
      const pricing = {
        baseFee: settings?.baseFee ?? 500,
        pricePerKm: settings?.pricePerKm ?? 150,
        freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? 5000_000,
        maxRadiusKm: settings?.maxRadiusKm ?? 850,
        maxFee: settings?.maxDeliveryFee ?? 40_000,
      };

      const deliveryFee = calculateDeliveryFee(data.deliveryDistance, subtotal, pricing);
      const total = subtotal + deliveryFee; // ✅ LIGNE AJOUTÉE (c'était le bug)

      // 3e. Création de la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          idempotencyKey: data.idempotencyKey,
          userId: session?.user?.id || null,
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
            create: orderItemsToCreate,
          },
        },
        include: {
          items: { include: { product: { include: { brand: true } } } },
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

      return { order: newOrder, subtotal, deliveryFee };
    });

    /* ---------- 4. Envoi des emails (hors transaction) ---------- */
    try {
      const emailOrder = {
        orderNumber: result.order.orderNumber,
        customerName: result.order.customerName,
        customerEmail: result.order.customerEmail,
        telephone: result.order.telephone,
        adresseLivraison: result.order.adresseLivraison,
        notes: result.order.notes,
        methodePaiement: result.order.methodePaiement,
        total: result.order.total,
        deliveryFee: result.deliveryFee,
        subtotal: result.subtotal,
        createdAt: result.order.createdAt,
        items: result.order.items.map((i) => ({
          productName: i.product.name,
          brandName: i.product.brand?.name,
          quantity: i.quantity,
          price: i.price,
          image: i.product.images?.[0],
          colorName: i.colorName,
          colorHex: i.colorHex,
        })),
      };

      await sendOrderConfirmationEmail(emailOrder);

      if (process.env.EMAIL_USER) {
        await sendNewOrderAdminEmail(emailOrder, process.env.EMAIL_USER);
      }
    } catch (emailError) {
      console.error("[orders] Erreur lors de l'envoi des emails:", emailError);
    }

    /* ---------- 5. Réponse succès ---------- */
    return NextResponse.json(
      {
        ok: true,
        orderNumber: result.order.orderNumber,
        orderId: result.order.id,
        total: result.order.total,
        deliveryFee: result.deliveryFee,
        subtotal: result.subtotal,
        itemCount: result.order.items.length,
      },
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