import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

/* =========================================================
   GET — Détail d'un produit
   ========================================================= */
export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, colors: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product });
}

/* =========================================================
   PATCH — Modifier un produit
   ========================================================= */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Vérifier qu'il existe + récupérer l'ancienne catégorie et l'ancien slug
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    /* ============================================
       🆕 REGÉNÉRATION DU SLUG
       ============================================ */

    // Récupérer la marque pour générer le slug
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marque introuvable" },
        { status: 400 }
      );
    }

    // Déterminer la base du slug
    let baseSlug: string;

    if (data.slug && data.slug.trim()) {
      // Slug fourni manuellement
      baseSlug = data.slug.trim();
    } else {
      // Génération automatique intelligente
      const brandInName = data.name
        .toLowerCase()
        .includes(brand.name.toLowerCase());

      const textToSlugify = brandInName
        ? data.name.trim()
        : `${brand.name} ${data.name.trim()}`;

      baseSlug = slugify(textToSlugify);
    }

    // Vérifier l'unicité en EXCLUANT le produit actuel
    let finalSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.product.findFirst({
        where: {
          slug: finalSlug,
          id: { not: id }, // ⬅️ Exclure le produit en cours de modification
        },
      })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    /* ============================================
       MISE À JOUR DU PRODUIT
       ============================================ */

    const product = await prisma.product.update({
      where: { id },
      data: {
        slug: finalSlug, // 🆕 Slug unique
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priceB2C: data.priceB2C,
        priceB2B: data.priceB2B ?? null,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        brandId: data.brandId,
        colors: {
          set: data.colorIds.map((id) => ({ id })),
        },
      },
      include: { brand: true, category: true, colors: true },
    });

    /* ============================================
       REVALIDATION DES CHEMINS
       ============================================ */

    revalidatePath("/");
    revalidatePath(`/${existing.category.slug}`); // Ancienne catégorie

    // Si la catégorie a changé, revalider aussi la nouvelle
    if (existing.category.slug !== product.category.slug) {
      revalidatePath(`/${product.category.slug}`);
    }

    // Ancien slug (si changé, l'ancienne page doit être invalidée)
    if (existing.slug && existing.slug !== product.slug) {
      revalidatePath(`/produits/${existing.slug}`);
    }

    // Nouveau slug (URL canonique actuelle)
    revalidatePath(`/produits/${product.slug}`);

    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("[PATCH /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification" },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE — Supprimer un produit
   ========================================================= */
export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { category: true, _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    // Refus si le produit a déjà été commandé (préserver l'historique)
    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer : ce produit a déjà été commandé. Utilisez plutôt la mise à jour du stock.",
        },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });

    /* ---- Revalidation ---- */
    revalidatePath("/");
    revalidatePath(`/${existing.category.slug}`);
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
}