import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { constructMetadata } from "@/lib/seo";
import { getIsB2BValidated } from "@/lib/pricing";
import { ProductCard } from "./product-card";
import { CatalogSidebar, CatalogToolbar } from "./catalog-filters";
import { Pagination } from "./pagination";

const PAGE_SIZE = 12;

type SearchParams = Record<string, string | string[] | undefined>;

type CatalogConfig = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
};

export const CATALOG_CONFIGS: Record<string, CatalogConfig> = {
  motos: {
    slug: "motos",
    title: "Motos",
    description: "Découvrez notre gamme complète de motos Apsonic, Honda, TVS, Haojue et Dayang. Modèles adaptés à tous les usages et tous les budgets.",
    seoTitle: "Motos — Apsonic, Honda, TVS, Haojue, Dayang",
    seoDescription: "Achetez votre moto en ligne au Bénin : Apsonic, Honda, TVS, Haojue, Dayang. Livraison rapide, garantie et SAV. Paiement Mobile Money.",
    heroSubtitle: "Apsonic · Honda · TVS · Haojue · Dayang",
  },
  tricycles: {
    slug: "tricycles",
    title: "Tricycles",
    description: "Tricycles robustes et économiques pour le transport de marchandises et de personnes. Modèles Apsonic disponibles en stock.",
    seoTitle: "Tricycles — Transport & livraison",
    seoDescription: "Tricycles Apsonic au Bénin : robustes, économiques, adaptés au transport de marchandises. Livraison rapide et garantie.",
    heroSubtitle: "Modèles Apsonic disponibles",
  },
  "pieces-detachees": {
    slug: "pieces-detachees",
    title: "Pièces Détachées",
    description: "Toutes les pièces détachées pour vos motos et tricycles. Pièces d'origine certifiées pour toutes les marques.",
    seoTitle: "Pièces Détachées motos & tricycles",
    seoDescription: "Pièces détachées d'origine pour motos et tricycles au Bénin. Apsonic, Honda, TVS, Haojue. Livraison rapide, prix compétitifs.",
    heroSubtitle: "Toutes marques · Pièces d'origine",
  },
  lubrifiants: {
    slug: "lubrifiants",
    title: "Lubrifiants",
    description: "Huiles moteur, graisses et lubrifiants de marques reconnues pour entretenir et protéger votre véhicule.",
    seoTitle: "Lubrifiants — Huiles & graisses moto",
    seoDescription: "Huiles moteur et lubrifiants moto de marques reconnues au Bénin. Livraison rapide, prix compétitifs.",
    heroSubtitle: "Huiles · Graisses · Entretien",
  },
};

function getString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateCatalogMetadata(
  config: CatalogConfig,
  searchParams: SearchParams,
  page: number
): Promise<Metadata> {
  const filters = Object.entries(searchParams)
    .filter(([k]) => k !== "page")
    .map(([, v]) => getString(v))
    .filter(Boolean)
    .join(" ");

  const titleSuffix = filters ? ` — ${filters}` : "";
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";

  return constructMetadata({
    pathname: `/${config.slug}`,
    title: `${config.seoTitle}${titleSuffix}${pageSuffix}`,
    description: config.seoDescription,
  });
}

export async function CatalogPage({
  config,
  searchParams,
}: {
  config: CatalogConfig;
  searchParams: SearchParams;
}) {
  const isB2B = await getIsB2BValidated();

  const category = await prisma.category.findUnique({
    where: { slug: config.slug },
  });

  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <p className="text-brand-black/50">Catégorie introuvable.</p>
      </div>
    );
  }

  const brandSlug = getString(searchParams.marque);
  const minPrice = Number(getString(searchParams.min)) || undefined;
  const maxPrice = Number(getString(searchParams.max)) || undefined;
  const sort = getString(searchParams.tri) || "recent";
  const page = Math.max(1, Number(getString(searchParams.page)) || 1);

  let orderBy: any = { createdAt: "desc" };
  if (sort === "prix-asc") orderBy = { priceB2C: "asc" };
  else if (sort === "prix-desc") orderBy = { priceB2C: "desc" };
  else if (sort === "nom-asc") orderBy = { name: "asc" };
  else if (sort === "nom-desc") orderBy = { name: "desc" };

  const where: any = {
    categoryId: category.id,
    ...(minPrice || maxPrice
      ? { priceB2C: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } }
      : {}),
    ...(brandSlug ? { brand: { name: { equals: brandSlug, mode: "insensitive" } } } : {}),
  };

  if (brandSlug) {
    const brandMatch = await prisma.brand.findFirst({
      where: { name: { equals: brandSlug, mode: "insensitive" } },
    });
    if (!brandMatch) {
      const allBrands = await prisma.brand.findMany();
      const matched = allBrands.find((b) => slugify(b.name) === brandSlug);
      if (matched) where.brandId = matched.id;
      else delete where.brand;
    } else {
      where.brandId = brandMatch.id;
      delete where.brand;
    }
  }

  const [products, totalCount, allBrandsInCategory] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { brand: true, category: true },
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({
      where: { products: { some: { categoryId: category.id } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.title,
    numberOfItems: totalCount,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        brand: p.brand.name,
        offers: {
          "@type": "Offer",
          price: (isB2B && p.priceB2B) ? p.priceB2B : p.priceB2C,
          priceCurrency: "XOF",
          availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-brand-black pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[500px] rounded-full bg-brand-red/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <nav aria-label="Fil d'Ariane" className="text-xs text-white/50">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{config.title}</span>
          </nav>

          <h1 className="mt-4 font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
            {config.title}
          </h1>
          <p className="mt-3 max-w-2xl text-white/60 md:text-lg">{config.description}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            {config.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="bg-brand-gray py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]">
            <div className="hidden md:block">
              <CatalogSidebar
                brands={allBrandsInCategory.map((b) => ({ id: b.id, name: b.name, slug: slugify(b.name) }))}
                totalCount={totalCount}
              />
            </div>

            <div className="min-w-0">
              <CatalogToolbar
                brands={allBrandsInCategory.map((b) => ({ id: b.id, name: b.name, slug: slugify(b.name) }))}
                totalCount={totalCount}
              />

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-black/10 bg-white py-20 text-center">
                  <Package className="h-12 w-12 text-brand-black/20" />
                  <h2 className="mt-4 font-display text-2xl tracking-wide text-brand-black">Aucun produit trouvé</h2>
                  <p className="mt-2 max-w-sm text-sm text-brand-black/50">Essayez de modifier vos filtres ou de revenir plus tard.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        priceB2C={p.priceB2C}
                        priceB2B={p.priceB2B}
                        isB2B={isB2B}
                        images={p.images}
                        brandName={p.brand.name}
                        categoryName={p.category.name}
                        stock={p.stock}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl={`/${config.slug}`}
                    searchParams={{
                      marque: brandSlug,
                      min: getString(searchParams.min),
                      max: getString(searchParams.max),
                      tri: sort !== "recent" ? sort : undefined,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}