import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(2, "Nom requis").max(60),
  logo: z.string().url("URL invalide").optional().or(z.literal("")),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        logo: parsed.data.logo || null,
      },
    });

    revalidatePath("/admin/marques");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, brand });
  } catch (error) {
    console.error("[PATCH /api/admin/brands/[id]]", error);
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

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) {
      return NextResponse.json({ error: "Marque introuvable" }, { status: 404 });
    }

    // Sécurité : refuser si la marque a des produits
    if (brand._count.products > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${brand._count.products} produit(s) sont liés à cette marque.`,
        },
        { status: 409 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    revalidatePath("/admin/marques");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/brands/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}