import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusUpdateSchema } from "@/lib/validations/order-admin";
import { canTransition, shouldRestock, type OrderStatus } from "@/lib/order-status";
import { sendOrderStatusUpdateEmail, sendOrderStatusAdminEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { statut, codeMTCN, preuvePaiement, noteInterne } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (!canTransition(order.statut as OrderStatus, statut as OrderStatus)) {
      return NextResponse.json(
        { error: `Transition non autorisée : ${order.statut} → ${statut}` },
        { status: 409 }
      );
    }

    // --- TRANSACTION SÉCURISÉE ---
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Remise en stock si annulation
      if (statut === "ANNULE" && shouldRestock(order.statut as OrderStatus)) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // 2. Mise à jour de la commande
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          statut,
          ...(codeMTCN !== undefined && { codeMTCN: codeMTCN || null }),
          ...(preuvePaiement !== undefined && { preuvePaiement: preuvePaiement || null }),
          ...(noteInterne !== undefined && { notes: noteInterne || null }),
        },
      });

      return updatedOrder;
    });

    // --- NOTIFICATIONS & EMAILS (Hors transaction pour ne pas la casser) ---
    // On utilise des try/catch séparés pour que si une notification plante, la commande est quand même mise à jour.
    try {
      // Notif Admin
      await prisma.notification.create({
        data: {
          title: "Statut commande mis à jour",
          message: `La commande ${order.orderNumber} est passée à : ${statut}`,
          type: "ORDER_UPDATE",
          link: `/admin/commandes/${order.id}`,
        },
      });

      // Notif Client
      if (order.userId) {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            title: `Commande ${statut.toLowerCase()}`,
            message: `Votre commande ${order.orderNumber} a été mise à jour.`,
            type: "ORDER_STATUS",
            link: `/compte/commandes/${order.id}`,
          },
        });
      }
    } catch (notifError) {
      console.error("[NOTIFICATION ERROR]", notifError);
      // On ne bloque pas la réponse si la notification échoue
    }

    try {
      // Emails
      if (updated.customerEmail) {
        await sendOrderStatusUpdateEmail(
          updated.customerEmail,
          updated.customerName,
          updated.orderNumber,
          statut
        );
      }

      if (process.env.EMAIL_USER) {
        await sendOrderStatusAdminEmail(
          updated.orderNumber,
          updated.customerName,
          statut,
          process.env.EMAIL_USER
        );
      }
    } catch (emailError) {
      console.error("[EMAIL ERROR]", emailError);
      // On ne bloque pas la réponse si l'email échoue
    }

    revalidatePath("/admin/commandes");
    revalidatePath(`/admin/commandes/${id}`);
    revalidatePath(`/compte/commandes/${id}`);
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, order: updated });

  } catch (error: any) {
    console.error("[PATCH /api/admin/orders/[id]]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
}