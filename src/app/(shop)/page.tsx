import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ShieldCheck,
  Truck as TruckIcon,
  Headphones,
  Sparkles,
} from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getIsB2BValidated } from "@/lib/pricing";
import { Hero } from "@/components/home/hero";
import { Testimonials } from "@/components/home/testimonials";
import { ProductCard } from "@/components/shop/product-card";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  pathname: "/",
  title: "PM Osons Oser — L'Excellence Motocycle & Pièces au Bénin",
  description:
    "Découvrez l'élite des deux et trois roues au Bénin. Apsonic, Honda, TVS, Haojue, Dayang, pièces certified et lubrifiants premium.",
});

const CATEGORIES = [
  {
    id: "01",
    slug: "motos",
    title: "Motos",
    subtitle: "Apsonic · Honda · TVS · Haojue · Dayang",
    image: "/categories/motos.jpg",
  },
  {
    id: "02",
    slug: "tricycles",
    title: "Tricycles",
    subtitle: "Puissance & Haute Capacité de Transport",
    image: "/categories/tricycles.jpg",
  },
  {
    id: "03",
    slug: "pieces-detachees",
    title: "Pièces Certified",
    subtitle: "Composants d'Origine Constructeur",
    image: "/categories/pieces.jpg",
  },
  {
    id: "04",
    slug: "lubrifiants",
    title: "Lubrifiants",
    subtitle: "Protection Ultime & Performance Moteur",
    image: "/categories/lubrifiants.jpg",
  },
];

const AVANTAGES = [
  {
    num: "01",
    icon: ShieldCheck,
    title: "Garantie Certifiée",
    desc: "Chaque véhicule et pièce bénéficie d'une traçabilité totale et d'une garantie constructeur officielle avec SAV dédié.",
  },
  {
    num: "02",
    icon: TruckIcon,
    title: "Logistique Express",
    desc: "Réseau de livraison ultra-rapide couvrant l'ensemble du territoire béninois sous 48h chrono.",
  },
  {
    num: "03",
    icon: Headphones,
    title: "Conciergerie Client",
    desc: "Un accompagnement sur-mesure 6j/7 par nos experts dédiés via WhatsApp, téléphone ou en atelier.",
  },
];

export default async function HomePage() {
  const isB2B = await getIsB2BValidated();

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { brand: true, category: true },
  });

  return (
    <div className="bg-[#0A0A0B] text-neutral-100 selection:bg-brand-red selection:text-white">
      {/* HEROSHICK SECTION */}
      <Hero />

      {/* SECTION CATÉGORIES — AWWWARDS GRID */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Header de section avec typographie éditoriale */}
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand-red">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
                Catalogue Exclusive
              </div>
              <h2 className="mt-4 font-display text-4xl font-extralight tracking-tight text-white md:text-6xl lg:text-7xl">
                Nos <span className="font-italic font-normal italic text-neutral-400">Collections</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-400 md:text-base">
              Explorez notre univers de mobilité. Des véhicules haute performance et des composants de précision sélectionnés pour le Bénin.
            </p>
          </div>

          {/* Dynamic Grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/50 p-7 transition-all duration-700 hover:border-brand-red/50 hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]"
              >
                {/* Background Image with Zoom */}
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-90"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

                {/* Card Top */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-white/50 group-hover:text-brand-red transition-colors">
                    {cat.id}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="relative z-10">
                  <h3 className="font-display text-3xl font-light tracking-wide text-white transition-transform duration-500 group-hover:-translate-y-1">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-400 line-clamp-1 group-hover:text-neutral-300">
                    {cat.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PRODUITS PHARES */}
      <section className="relative border-t border-white/10 bg-neutral-950/80 py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-500">
                [ Curated Selection ]
              </span>
              <h2 className="mt-3 font-display text-4xl font-extralight tracking-tight text-white md:text-6xl">
                Produits <span className="underline decoration-brand-red/50 underline-offset-8">Phares</span>
              </h2>
            </div>

            <Link
              href="/motos"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:border-white hover:bg-white hover:text-black"
            >
              <span>Tout le catalogue</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="mt-20 flex h-64 items-center justify-center rounded-3xl border border-dashed border-white/10">
              <p className="text-sm font-mono text-neutral-500">
                Aucune pièce disponible actuellement.
              </p>
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {products.map((p) => (
                <div key={p.id} className="transition-transform duration-500 hover:-translate-y-2">
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
          )}
        </div>
      </section>

      {/* SECTION AVANTAGES / WHY US */}
      <section className="relative border-t border-white/10 py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-red">
              Standards d'Excellence
            </span>
            <h2 className="mt-4 font-display text-4xl font-extralight text-white md:text-6xl">
              L'Expérience PM Osons Oser
            </h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            {AVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/30 p-10 backdrop-blur-sm transition-all duration-500 hover:border-white/30 hover:bg-neutral-900/80"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-red/20 bg-brand-red/10 text-brand-red transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-sm text-neutral-600">
                        {a.num}
                      </span>
                    </div>

                    <h3 className="mt-8 font-display text-2xl font-light text-white">
                      {a.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                      {a.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* BANNIÈRE PRO B2B HIGH-END */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 p-10 md:p-20">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-red/20 blur-[120px]" />
            <div className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-amber-400">
                <Sparkles className="h-3 w-3" /> Espace Partenaires B2B
              </div>

              <h2 className="mt-6 font-display text-4xl font-extralight tracking-tight text-white md:text-6xl">
                Vous êtes un <span className="italic font-serif font-normal text-amber-200">professionnel</span> du secteur ?
              </h2>

              <p className="mt-6 text-base leading-relaxed text-neutral-400 md:text-lg">
                Garages, revendeurs, flottes d'entreprises : bénéficiez de grilles tarifaires dégressives sur tout le catalogue et d'un gestionnaire de compte dédié.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/pro"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all duration-500 hover:bg-brand-red hover:text-white"
                >
                  <span>Devenir partenaire B2B</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}