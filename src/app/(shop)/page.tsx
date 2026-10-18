import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Truck as TruckIcon,
  Headphones,
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
  title: "PM Osons Oser — Motos, Tricycles, Pièces & Lubrifiants au Bénin",
  description:
    "Achetez en ligne vos motos Apsonic, Honda, TVS, Haojue et Dayang, vos tricycles, pièces détachées et lubrifiants. Livraison rapide au Bénin. Paiement Mobile Money.",
});

const CATEGORIES = [
  { slug: "motos", title: "Motos", subtitle: "Apsonic · Honda · TVS · Haojue · Dayang", image: "/categories/motos.jpg" },
  { slug: "tricycles", title: "Tricycles", subtitle: "Transport & livraison", image: "/categories/tricycles.jpg" },
  { slug: "pieces-detachees", title: "Pièces Détachées", subtitle: "Toutes marques", image: "/categories/pieces.jpg" },
  { slug: "lubrifiants", title: "Lubrifiants", subtitle: "Huiles & graisses", image: "/categories/lubrifiants.jpg" },
];

const AVANTAGES = [
  { icon: ShieldCheck, title: "Produits garantis", desc: "Véhicules et pièces d'origine certifiés, avec garantie et SAV." },
  { icon: TruckIcon, title: "Livraison rapide", desc: "Partout au Bénin sous 48h. Suivi de commande en temps réel." },
  { icon: Headphones, title: "Support dédié", desc: "Une équipe disponible 6j/7 par téléphone, email ou WhatsApp." },
];

export default async function HomePage() {
  const isB2B = await getIsB2BValidated();

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { brand: true, category: true },
  });

  return (
    <>
      <Hero />

      {/* CATÉGORIES */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
              Catalogue
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-brand-black md:text-5xl">
              Nos catégories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-brand-black/60">
              Tout ce dont vous avez besoin pour rouler, entretenir et équiper vos deux et trois roues.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-brand-black/5 bg-brand-gray transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
                <div className="relative p-5">
                  <h3 className="font-display text-2xl tracking-wide text-white">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/70">{cat.subtitle}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-brand-red">
                    Voir
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUITS PHARES */}
      <section className="bg-brand-gray py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
                Sélection
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-brand-black md:text-5xl">
                Produits phares
              </h2>
              <p className="mt-3 max-w-xl text-brand-black/60">
                Découvrez une sélection de nos meilleures ventes, mises à jour régulièrement.
              </p>
            </div>
            <Link
              href="/motos"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-brand-red"
            >
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="mt-14 text-center text-brand-black/50">
              Aucun produit disponible pour le moment.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
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
          )}
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
              Pourquoi nous
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-brand-black md:text-5xl">
              L'expérience PM Osons Oser
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {AVANTAGES.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className="group rounded-2xl border border-brand-black/5 bg-brand-gray p-8 transition hover:-translate-y-1 hover:border-brand-red/20 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl tracking-wide text-brand-black">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-black/60">
                    {a.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA B2B */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-black via-brand-black to-brand-red/20 p-10 md:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-red/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
                Professionnels
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-white md:text-5xl">
                Vous êtes garage ou revendeur ?
              </h2>
              <p className="mt-4 text-white/70">
                Accédez à des prix dégressifs sur l'ensemble du catalogue (motos, tricycles, pièces et lubrifiants). Créez votre compte pro et bénéficiez d'un espace dédié.
              </p>
              <Link
                href="/pro"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90"
              >
                Devenir partenaire
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}