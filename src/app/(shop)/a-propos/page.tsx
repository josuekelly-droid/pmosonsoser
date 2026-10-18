import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, ShieldCheck, HeartHandshake, Zap, Quote } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "À propos — Notre histoire & Notre vision",
  description: "Découvrez l'histoire de PM Osons Oser, votre partenaire de confiance pour la vente de motos, tricycles, pièces détachées et lubrifiants au Bénin.",
  pathname: "/a-propos",
});

const VALUES = [
  { icon: ShieldCheck, title: "Fiabilité", desc: "Des produits certifiés et d'origine, garantis pour votre sécurité et votre tranquillité." },
  { icon: Zap, title: "Innovation", desc: "Une plateforme digitale moderne qui simplifie l'accès aux pièces et véhicules." },
  { icon: HeartHandshake, title: "Proximité", desc: "Un service client à l'écoute, une livraison rapide et un accompagnement personnalisé." },
];

export default function AProposPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-black pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Notre Histoire
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl">
            OSONS <span className="text-brand-red">OSER</span><br />
            Révolutionner la mobilité
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
            PM Osons Oser est né d'une ambition simple : offrir aux Béninois un accès direct, fiable et transparent aux véhicules deux et trois roues, ainsi qu'à leurs pièces et lubrifiants.
          </p>
        </div>
      </section>

      {/* NOTRE MISSION */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-brand-gray shadow-xl">
              <Image
                src="/logo/pm-osons-oser-1.jpg" // Tu pourras remplacer par une belle photo de ta boutique
                alt="L'univers PM Osons Oser"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="mt-6 font-display text-3xl tracking-wide text-brand-black md:text-4xl">
                Notre Mission
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-black/70">
                Nous avons constaté que trouver une moto fiable, une pièce détachée d'origine ou un lubrifiant de qualité au Bénin relevait souvent du parcours du combattant. Entre les marchés informels et les intermédiaires, le client final manquait de repères et de garanties.
              </p>
              <p className="mt-4 text-base leading-relaxed text-brand-black/70">
                <strong className="text-brand-black">PM Osons Oser</strong> a été créé pour changer cela. Nous digitalisons le secteur en proposant un catalogue en ligne transparent, des prix justes, et une livraison rapide partout au Bénin. Que vous soyez un particulier ou un professionnel, vous méritez le meilleur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="bg-brand-gray py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
              Nos Valeurs
            </h2>
            <p className="mt-3 text-sm text-brand-black/60">Ce qui nous guide au quotidien.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-3xl border border-brand-black/5 bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-xl tracking-wide text-brand-black">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-black/60">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LE RESPONSABLE */}
      <section className="relative overflow-hidden bg-brand-black py-20 md:py-28">
        <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-brand-red/10 blur-[100px]" />
        <div className="relative mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_1.5fr] md:gap-16">
            
            {/* Photo du responsable */}
            <div className="mx-auto w-full max-w-[280px] md:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                {/* 
                  ⚠️ REMPLACE CE LIEN PAR TA PHOTO 
                  (tu peux utiliser une image externe https://... ou mettre ta photo dans public/images/ et mettre "/images/parfait.jpg")
                */}
                <Image
                  src="/responsable/parfait-agblonon.jpg"
                  alt="Parfait Senan AGBLONON"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Citation */}
            <div>
              <Quote className="h-12 w-12 text-brand-red/30" />
              <blockquote className="mt-4">
                <p className="text-xl italic leading-relaxed text-white/90 md:text-2xl">
                  « Notre ambition n'est pas seulement de vendre des motos. Notre ambition est de redonner confiance aux utilisateurs, de professionnaliser le marché et de prouver qu'au Bénin, on peut bâtir des entreprises digitales de classe mondiale. Oser, c'est croire en nos potentialités. »
                </p>
              </blockquote>
              
              <div className="mt-8">
                <p className="font-display text-2xl tracking-wide text-white md:text-3xl">
                  Parfait Senan AGBLONON
                </p>
                <p className="mt-1 text-sm font-medium uppercase tracking-widest text-brand-red">
                  Responsable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 text-center">
        <Link href="/motos" className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90">
          Découvrir notre catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}