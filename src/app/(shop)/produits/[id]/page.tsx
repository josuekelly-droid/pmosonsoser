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
  ArrowUpRight,
  Palette,
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
import { ProductPurchaseBlock } from "@/components/shop/product-purchase-block";

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
  { icon: Headphones, title: "SAV dédié", desc: "Support client 6j/7" },
];

export default async function ProduitPage({ params }: Props) {
  const { id } = await params;
  const isB2B = await getIsB2BValidated();

  // ⬇️ AJOUT DE `colors: true` DANS L'INCLUDE
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, colors: true }, 
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-brand-red/10 blur-[180px] pointer-events-none" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* BREADCRUMB + HERO MINI */}
      <section className="relative pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Link href="/" className="transition-colors hover:text-white">Accueil</Link>
            <ChevronRight className="h-3 w-3 text-brand-red" />
            <Link href={`/${product.category.slug}`} className="transition-colors hover:text-white">{product.category.name}</Link>
            <ChevronRight className="h-3 w-3 text-brand-red" />
            <span className="truncate text-white">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* FICHE PRODUIT GLASSMORPHISM */}
      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10 lg:p-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              
              {/* Galerie */}
              <div className="lg:sticky lg:top-32 lg:self-start">
                <ProductGallery images={product.images} alt={product.name} brandName={product.brand.name} />
              </div>

              {/* Détails */}
              <div className="flex flex-col">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/${product.category.slug}`} className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur-md transition-colors hover:border-brand-red/50 hover:text-white">
                    {product.category.name}
                  </Link>
                  <Link href={`/${product.category.slug}?marque=${slugify(product.brand.name)}`} className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur-md transition-colors hover:border-brand-red/50 hover:text-white">
                    {product.brand.name}
                  </Link>
                </div>

                {/* Nom */}
                <h1 className="mt-5 font-display text-3xl font-light leading-[1.1] tracking-wide text-white sm:text-4xl md:text-5xl">
                  {product.name}
                </h1>

                {/* Référence */}
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Réf. {product.id.slice(0, 12).toUpperCase()}
                </p>

                {/* Prix */}
                <div className="mt-7 flex flex-wrap items-end gap-4 border-b border-white/10 pb-7">
                  <span className="font-display text-4xl font-light tracking-wide text-brand-red md:text-5xl">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasB2BPrice ? (
                    <div className="flex flex-col pb-1">
                      <span className="font-mono text-xs text-neutral-500 line-through">
                        {formatPrice(product.priceB2C)}
                      </span>
                      <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg mt-1">
                        Économisez {formatPrice(savings)}
                      </span>
                    </div>
                  ) : (
                    product.priceB2B && product.priceB2B > 0 && (
                       <span className="font-mono text-xs text-neutral-400 mb-1">
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
                  <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white">
                    <Info className="h-4 w-4 text-brand-red" />
                    Description technique
                  </h2>
                  <p className="mt-3 font-mono text-xs md:text-sm leading-relaxed text-neutral-300">
                    {product.description || `Découvrez ${product.name} de la marque ${product.brand.name}, disponible immédiatement chez PM Osons Oser. Produit d'origine certifiée, garanti et livré avec tous les documents officiels.`}
                  </p>
                </div>

                <div className="mt-8">
  <ProductPurchaseBlock
    product={{
      id: product.id,
      name: product.name,
      priceB2C: displayPrice,
      images: product.images,
      stock: product.stock,
    }}
    colors={product.colors}
  />
</div>

                {/* Moyens de paiement */}
                <div className="mt-10 border-t border-white/10 pt-8">
                  <div className="mb-4 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                      Paiement 100% sécurisé
                    </span>
                  </div>
                  <PaymentBadges />
                </div>
              </div>

            </div>
          </div>

          {/* AVANTAGES */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-y border-white/10 py-10 md:grid-cols-4 md:gap-6">
            {AVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title} className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur-2xl">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-white">{a.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-neutral-400">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DÉTAILS TECHNIQUES & LIVRAISON */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
              <h3 className="font-display text-xl font-light text-white mb-4">Livraison & Retours</h3>
              <ul className="space-y-3 font-mono text-xs text-neutral-300">
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Expédition sous 24-48h à Cotonou et environs</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Livraison nationale sous 3-5 jours ouvrés</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Retour sous 7 jours ouvrés (produit non altéré)</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Frais de transport calculés selon la distance</li>
              </ul>
            </div>
            
            <div className="rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
              <h3 className="font-display text-xl font-light text-white mb-4">Garantie & Support</h3>
              <ul className="space-y-3 font-mono text-xs text-neutral-300">
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Garantie constructeur officielle incluse</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Service après-vente assuré en agence</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Assistance dédiée par téléphone et WhatsApp</li>
                <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />Facture normalisée et pièces d'origine</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUITS SIMILAIRES */}
      {related.length > 0 && (
        <section className="relative py-20 border-t border-white/10 bg-black/40">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">[ Suggestions ]</span>
                <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">Produits similaires</h2>
              </div>
              <Link href={`/${product.category.slug}`} className="hidden shrink-0 font-mono text-xs uppercase tracking-widest text-brand-red transition hover:text-white md:inline-flex items-center gap-1">
                <span>Voir tout</span> <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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
    </div>
  );
}