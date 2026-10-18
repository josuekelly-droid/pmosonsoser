import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.typeCompte === "B2B" || user.typeCompte === "PREMIUM") {
      return NextResponse.json(
        { error: "Vous êtes déjà un professionnel ou une demande est en cours." },
        { status: 400 }
      );
    }

    // Mise à jour du compte + création notification Admin
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          typeCompte: "B2B",
          statutValidation: "EN_ATTENTE",
        },
      }),
      prisma.notification.create({
        data: {
          title: "Demande Pro B2B",
          message: `${user.name || user.email} souhaite passer en compte Professionnel.`,
          type: "B2B_REQUEST",
          link: "/admin/utilisateurs?type=B2B&statut=EN_ATTENTE",
        },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Demande envoyée avec succès." });
  } catch (error) {
    console.error("[POST /api/client/upgrade-b2b]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}