import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { colorSchema } from "@/lib/validations/color";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = colorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const color = await prisma.color.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        hex: parsed.data.hex.toUpperCase(),
      },
    });

    revalidatePath("/admin/couleurs");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, color });
  } catch (error) {
    console.error("[PATCH /api/admin/colors/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const color = await prisma.color.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!color) {
      return NextResponse.json({ error: "Couleur introuvable" }, { status: 404 });
    }

    // Si la couleur est utilisée, on la retire simplement des produits
    if (color._count.products > 0) {
      await prisma.color.update({
        where: { id },
        data: { products: { set: [] } },
      });
    }

    await prisma.color.delete({ where: { id } });

    revalidatePath("/admin/couleurs");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/colors/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}