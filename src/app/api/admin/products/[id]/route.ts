import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

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
    include: { brand: true, category: true },
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

    // Vérifier qu'il existe + récupérer le slug de la catégorie pour revalidate
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

    const product = await prisma.product.update({
      where: { id },
      data: {
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

    /* ---- Revalidation ---- */
    revalidatePath("/");
    revalidatePath(`/${existing.category.slug}`);
    revalidatePath(`/${product.category.slug}`);
    revalidatePath(`/produits/${id}`);
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