import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCw,
  Lock,
  Info,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { constructMetadata, siteConfig } from "@/lib/seo";
import { formatPrice, slugify } from "@/lib/utils";
import { getIsB2BValidated } from "@/lib/pricing";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductCard } from "@/components/shop/product-card";
import { StockIndicator } from "@/components/shop/stock-indicator";
import { PaymentBadges } from "@/components/shop/payment-badges";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true },
  });

  if (!product) {
    return constructMetadata({ title: "Produit introuvable", noIndex: true });
  }

  return constructMetadata({
    pathname: `/produits/${product.id}`,
    title: `${product.name} — ${product.brand.name}`,
    description: product.description
      ? product.description.slice(0, 155)
      : `Achetez ${product.name} (${product.brand.name}) au meilleur prix chez PM Osons Oser. Livraison rapide au Bénin, paiement Mobile Money.`,
    image: product.images?.[0],
  });
}

const AVANTAGES = [
  { icon: Truck, title: "Livraison rapide", desc: "Partout au Bénin en 48h" },
  { icon: ShieldCheck, title: "Garantie constructeur", desc: "Pièces d'origine certifiées" },
  { icon: RefreshCw, title: "Retour 7 jours", desc: "Satisfait ou remboursé" },
  { icon: Headphones, title: "SAV dédié", desc: "Support 6j/7" },
];

export default async function ProduitPage({ params }: Props) {
  const { id } = await params;
  const isB2B = await getIsB2BValidated();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    orderBy: [{ brandId: "asc" }, { createdAt: "desc" }],
    take: 4,
    include: { brand: true, category: true },
  });

  // Logique de prix
  const hasB2BPrice = isB2B && product.priceB2B && product.priceB2B > 0;
  const displayPrice = hasB2BPrice ? product.priceB2B! : product.priceB2C;
  const savings = hasB2BPrice ? product.priceB2C - product.priceB2B! : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — ${product.brand.name} disponible chez PM Osons Oser.`,
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand.name },
    category: product.category.name,
    image: product.images?.length
      ? product.images.map((img) => (img.startsWith("http") ? img : `${siteConfig.url}${img}`))
      : [`${siteConfig.url}/logo/pm-osons-oser-1.jpg`],
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/produits/${product.id}`,
      priceCurrency: "XOF",
      price: displayPrice,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: product.category.name, item: `${siteConfig.url}/${product.category.slug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteConfig.url}/produits/${product.id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* BREADCRUMB + HERO MINI */}
      <section className="relative overflow-hidden bg-brand-black pt-28 pb-10 md:pt-32 md:pb-14">
        <div className="pointer-events-none absolute -top-32 right-0 h-[300px] w-[400px] rounded-full bg-brand-red/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${product.category.slug}`} className="transition-colors hover:text-white">{product.category.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-white">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* FICHE PRODUIT */}
      <section className="relative bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="-mt-6 rounded-3xl border border-brand-black/5 bg-white p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] md:-mt-8 md:p-10 lg:p-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Galerie */}
              <div className="lg:sticky lg:top-32 lg:self-start">
                <ProductGallery images={product.images} alt={product.name} brandName={product.brand.name} />
              </div>

              {/* Détails */}
              <div className="flex flex-col">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/${product.category.slug}`} className="rounded-full bg-brand-gray px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-black/70 transition hover:bg-brand-red/10 hover:text-brand-red">
                    {product.category.name}
                  </Link>
                  <Link href={`/${product.category.slug}?marque=${slugify(product.brand.name)}`} className="rounded-full bg-brand-gray px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-black/70 transition hover:bg-brand-red/10 hover:text-brand-red">
                    {product.brand.name}
                  </Link>
                </div>

                {/* Nom */}
                <h1 className="mt-5 font-display text-3xl leading-[1.05] tracking-wide text-brand-black sm:text-4xl md:text-5xl">
                  {product.name}
                </h1>

                {/* Référence */}
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-black/40">
                  Réf. {product.id.slice(0, 12).toUpperCase()}
                </p>

                {/* Prix */}
                <div className="mt-7 flex flex-wrap items-end gap-4 border-b border-brand-black/5 pb-7">
                  <span className="font-display text-4xl tracking-wide text-brand-red md:text-5xl">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasB2BPrice ? (
                    <div className="flex flex-col pb-1">
                      <span className="text-xs text-brand-black/40 line-through">
                        {formatPrice(product.priceB2C)}
                      </span>
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-1">
                        Économisez {formatPrice(savings)}
                      </span>
                    </div>
                  ) : (
                    product.priceB2B && product.priceB2B > 0 && (
                       <span className="text-xs text-brand-black/40 mb-1">
                         Prix pro : {formatPrice(product.priceB2B)}
                       </span>
                    )
                  )}
                </div>

                {/* Stock temps réel */}
                <div className="mt-7">
                  <StockIndicator stock={product.stock} />
                </div>

                {/* Description */}
                <div className="mt-8">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-black">
                    <Info className="h-4 w-4 text-brand-red" />
                    Description
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-brand-black/70">
                    {product.description || `Découvrez ${product.name} de la marque ${product.brand.name}, disponible immédiatement chez PM Osons Oser. Produit neuf, garanti et livré avec tous les papiers en règle.`}
                  </p>
                </div>

                {/* Ajouter au panier */}
                <div className="mt-9">
                  <AddToCart
                    product={{
                      id: product.id,
                      name: product.name,
                      priceB2C: displayPrice, // On passe le prix B2B ou B2C
                      images: product.images,
                      stock: product.stock,
                    }}
                  />
                </div>

                {/* Moyens de paiement */}
                <div className="mt-10 border-t border-brand-black/5 pt-8">
                  <div className="mb-4 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-brand-black/50" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-black/60">
                      Paiement sécurisé
                    </span>
                  </div>
                  <PaymentBadges />
                </div>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div className="mt-20 grid grid-cols-2 gap-4 border-y border-brand-black/5 py-10 md:mt-24 md:grid-cols-4 md:gap-6">
            {AVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title} className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-black">{a.title}</p>
                    <p className="mt-0.5 text-xs text-brand-black/60">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Détails techniques */}
          <div className="mt-20 grid grid-cols-1 gap-6 md:mt-24 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-black/5 bg-brand-gray/40 p-6 md:p-8">
              <h3 className="font-display text-xl tracking-wide text-brand-black">Livraison & Retours</h3>
              <ul className="mt-5 space-y-3.5 text-sm text-brand-black/70">
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Livraison sous 24-48h à Cotonou et environs</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Livraison nationale sous 3-5 jours ouvrés</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Retour gratuit sous 7 jours (produit non utilisé)</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Frais de livraison calculés selon la zone</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-black/5 bg-brand-gray/40 p-6 md:p-8">
              <h3 className="font-display text-xl tracking-wide text-brand-black">Garantie & Support</h3>
              <ul className="mt-5 space-y-3.5 text-sm text-brand-black/70">
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Garantie constructeur selon le produit</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Service après-vente disponible en boutique</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Support client : +229 XX XX XX XX</li>
                <li className="flex items-start gap-2.5"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-red" />Facture professionnelle fournie</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUITS SIMILAIRES */}
      {related.length > 0 && (
        <section className="bg-brand-gray py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">Recommandations</span>
                <h2 className="mt-2 font-display text-3xl tracking-wide text-brand-black md:text-4xl">Produits similaires</h2>
              </div>
              <Link href={`/${product.category.slug}`} className="hidden shrink-0 text-sm font-semibold text-brand-red transition hover:text-brand-black md:inline-flex">
                Voir tout →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((p) => (
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
          </div>
        </section>
      )}
    </>
  );
}