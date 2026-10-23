import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Nom requis").max(60),
  slug: z.string().min(2).max(60).optional(),
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
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const slug = parsed.data.slug?.trim() || slugify(name);

    // Vérifier si le nouveau slug est déjà pris par une autre catégorie
    const existing = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par une autre catégorie." },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/produits");
    revalidatePath(`/${category.slug}`);

    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error("[PATCH /api/admin/categories/[id]]", error);
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    }

    // Sécurité : refuser si la catégorie a des produits
    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${category._count.products} produit(s) sont liés à cette catégorie.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}