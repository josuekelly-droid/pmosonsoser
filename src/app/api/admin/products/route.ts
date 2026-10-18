import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

/* =========================================================
   GET — Liste paginée + filtres (recherche, catégorie, stock)
   ========================================================= */
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim() || "";
  const categoryId = searchParams.get("categoryId") || "";
  const stockFilter = searchParams.get("stock") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const PAGE_SIZE = 15;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (stockFilter === "low") where.stock = { lte: 5 };
  if (stockFilter === "out") where.stock = 0;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    ok: true,
    products,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

/* =========================================================
   POST — Créer un produit
   ========================================================= */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priceB2C: data.priceB2C,
        priceB2B: data.priceB2B ?? null,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        brandId: data.brandId,
      },
      include: { brand: true, category: true },
    });

    /* ---- Revalidation (SEO + affichage temps réel) ---- */
    revalidatePath("/");
    revalidatePath(`/${product.category.slug}`);
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
}