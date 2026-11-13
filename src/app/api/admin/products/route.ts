import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";

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

    /* ============================================
       🆕 GÉNÉRATION DU SLUG UNIQUE
       ============================================ */

    // 1. Récupérer la marque pour générer le slug
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marque introuvable" },
        { status: 400 }
      );
    }

    // 2. Déterminer la base du slug
    let baseSlug: string;

    if (data.slug && data.slug.trim()) {
      // Slug fourni manuellement par l'admin
      baseSlug = data.slug.trim();
    } else {
      // Génération automatique intelligente :
      // On vérifie si la marque est DÉJÀ dans le nom pour éviter les doublons
      const brandInName = data.name
        .toLowerCase()
        .includes(brand.name.toLowerCase());

      const textToSlugify = brandInName
        ? data.name.trim()
        : `${brand.name} ${data.name.trim()}`;

      baseSlug = slugify(textToSlugify);
    }

    // 3. Vérifier l'unicité et ajouter un suffixe si nécessaire
    let finalSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.product.findUnique({ where: { slug: finalSlug } })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    /* ============================================
       CRÉATION DU PRODUIT
       ============================================ */

    const product = await prisma.product.create({
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
          connect: data.colorIds.map((id) => ({ id })),
        },
      },
      include: { brand: true, category: true, colors: true },
    });

    /* ---- Revalidation (SEO + affichage temps réel) ---- */
    revalidatePath("/");
    revalidatePath(`/${product.category.slug}`);
    revalidatePath(`/produits/${product.slug}`); // 🆕 Utilise le slug
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