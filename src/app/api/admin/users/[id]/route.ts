import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations/admin";

type Params = { params: Promise<{ id: string }> };

/* =========================================================
   PATCH — Modifier rôle, statut B2B, type de compte
   ========================================================= */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Empêcher un admin de se retirer lui-même ses droits
    if (id === session.user.id && parsed.data.role === "CLIENT") {
      return NextResponse.json(
        { error: "Impossible de retirer votre propre rôle admin." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        typeCompte: true,
        statutValidation: true,
      },
    });

    revalidatePath("/admin/utilisateurs");
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/* =========================================================
   DELETE — Supprimer un utilisateur (si aucune commande)
   ========================================================= */
export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Impossible de vous supprimer vous-même." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    if (user._count.orders > 0) {
      return NextResponse.json(
        {
          error:
            "Cet utilisateur a des commandes. Désactivez plutôt son compte.",
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/utilisateurs");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}