import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Target, ShieldCheck, HeartHandshake, Zap, Quote } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "À propos — Notre histoire & Notre vision",
  description: "Découvrez l'histoire de PM Osons Oser, votre partenaire de confiance pour la vente de motos, tricycles, pièces détachées et lubrifiants au Bénin.",
  pathname: "/a-propos",
});

const VALUES = [
  { icon: ShieldCheck, title: "Fiabilité", desc: "Des produits certifiés et d'origine, garantis pour votre sécurité et votre tranquillité sur les routes." },
  { icon: Zap, title: "Innovation", desc: "Une plateforme digitale moderne qui simplifie l'accès aux véhicules et aux composants techniques." },
  { icon: HeartHandshake, title: "Proximité", desc: "Un service client à l'écoute, une livraison rapide et un accompagnement sur-mesure au Bénin." },
];

export default function AProposPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />
      <div className="absolute -left-40 bottom-1/3 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
            [ Notre Histoire ]
          </span>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl">
            OSONS <span className="italic font-serif text-brand-red">OSER</span><br />
            Révolutionner la mobilité
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-mono text-xs md:text-sm leading-relaxed text-neutral-400">
            PM Osons Oser est né d'une ambition simple : offrir aux Béninois un accès direct, fiable et transparent aux véhicules deux et trois roues, ainsi qu'à leurs pièces et lubrifiants.
          </p>
        </div>
      </section>

      {/* NOTRE MISSION */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 shadow-2xl backdrop-blur-2xl">
              <Image
                src="/logo/pm-osons-oser-1.jpg"
                alt="L'univers PM Osons Oser"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Target className="h-7 w-7" />
              </div>
              <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                [ Vision & Impact ]
              </span>
              <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
                Notre Mission
              </h2>
              <p className="mt-4 font-mono text-xs md:text-sm leading-relaxed text-neutral-400">
                Trouver une moto fiable, une pièce détachée d'origine ou un lubrifiant de qualité au Bénin relevait souvent du parcours du combattant. Entre les marchés informels et les intermédiaires, le client final manquait de repères et de garanties.
              </p>
              <p className="mt-4 font-mono text-xs md:text-sm leading-relaxed text-neutral-400">
                <strong className="text-white font-sans font-semibold">PM Osons Oser</strong> a été créé pour changer cela. Nous digitalisons le secteur en proposant un catalogue en ligne transparent, des prix justes, et une livraison rapide partout au Bénin. Que vous soyez un particulier ou un professionnel, vous méritez l'excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                [ Piliers ]
            </span>
            <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
              Nos Valeurs
            </h2>
            <p className="mt-2 font-mono text-xs text-neutral-400">Ce qui nous guide au quotidien dans notre quête d'excellence.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-light tracking-wide text-white">{v.title}</h3>
                  <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LE RESPONSABLE */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-14">
            <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-red/10 blur-[120px]" />

            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_1.5fr] md:gap-16">
              
              {/* Photo du responsable */}
              <div className="mx-auto w-full max-w-[260px] md:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl">
                  <Image
                    src="/responsable/parfait-agblonon.jpg"
                    alt="Parfait Senan AGBLONON"
                    fill
                    sizes="(max-width: 768px) 260px, 350px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Citation */}
              <div>
                <Quote className="h-10 w-10 text-brand-red" />
                <blockquote className="mt-4">
                  <p className="font-display text-xl italic font-light leading-relaxed text-white md:text-2xl">
                    « Notre ambition n'est pas seulement de vendre des motos. Notre ambition est de redonner confiance aux utilisateurs, de professionnaliser le marché et de prouver qu'au Bénin, on peut bâtir des entreprises digitales de classe mondiale. Oser, c'est croire en nos potentialités. »
                  </p>
                </blockquote>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="font-display text-2xl font-light tracking-wide text-white">
                    Parfait Senan AGBLONON
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                    Responsable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-28 pt-8 text-center">
        <Link
          href="/motos"
          className="group inline-flex h-14 items-center gap-3 rounded-full border border-brand-red/30 bg-brand-red px-8 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black hover:shadow-brand-red/40"
        >
          <span>Découvrir notre catalogue</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </Link>
      </section>
    </div>
  );
}