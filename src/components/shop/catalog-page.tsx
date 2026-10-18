import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";
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
      <div className="flex min-h-[60vh] items-center justify-center pt-32 bg-[#0A0A0B] text-white">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">404 · Erreur</p>
          <h2 className="mt-2 font-display text-2xl font-light">Catégorie introuvable</h2>
        </div>
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
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-brand-red selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO CATALOGUE */}
      <section className="relative isolate overflow-hidden border-b border-white/10 pt-36 pb-20 md:pt-48 md:pb-28">
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[600px] rounded-full bg-brand-red/15 blur-[150px]" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          {/* Fil d'Ariane */}
          <nav aria-label="Fil d'Ariane" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
            <span className="mx-2.5 text-neutral-700">/</span>
            <span className="text-white">{config.title}</span>
          </nav>

          <h1 className="mt-6 font-display text-5xl font-extralight uppercase tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            {config.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
            {config.description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-brand-red">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            {config.heroSubtitle}
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL : FILTRES + GRILLE */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] md:gap-10 lg:grid-cols-[300px_1fr]">
            
            {/* SIDEBAR DESKTOP */}
            <div className="hidden md:block">
              <CatalogSidebar
                brands={allBrandsInCategory.map((b) => ({ id: b.id, name: b.name, slug: slugify(b.name) }))}
                totalCount={totalCount}
              />
            </div>

            {/* COLONNE PRODUITS */}
            <div className="min-w-0">
              <CatalogToolbar
                brands={allBrandsInCategory.map((b) => ({ id: b.id, name: b.name, slug: slugify(b.name) }))}
                totalCount={totalCount}
              />

              {products.length === 0 ? (
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-16 text-center backdrop-blur-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-500">
                    <Package className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-light text-white">
                    Aucun produit <span className="italic font-serif font-normal text-neutral-400">trouvé</span>
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-400">
                    Essayez de modifier vos critères de filtrage ou réinitialisez votre recherche.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((p) => (
                      <div key={p.id} className="transition-transform duration-500 hover:-translate-y-1.5">
                        <ProductCard
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
                      </div>
                    ))}
                  </div>

                  <div className="mt-16">
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}