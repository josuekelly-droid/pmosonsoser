import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Store, TrendingUp, Truck, ShieldCheck, Headphones } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Devenir Partenaire B2B",
  description: "Rejoignez le réseau PM Osons Oser. Prix dégressifs sur les motos, pièces détachées et lubrifiants pour les professionnels.",
  pathname: "/pro",
});

const BENEFITS = [
  { icon: TrendingUp, title: "Prix dégressifs", desc: "Jusqu'à -15% sur tout le catalogue selon vos volumes d'achat professionnels." },
  { icon: Truck, title: "Livraison prioritaire", desc: "Vos commandes d'approvisionnement sont traitées et acheminées en priorité." },
  { icon: ShieldCheck, title: "Compte validé", desc: "Un accès sécurisé et privilégié après validation de vos documents d'entreprise." },
  { icon: Headphones, title: "Support dédié", desc: "Un interlocuteur institutionnel unique pour toutes vos demandes B2B." },
];

export default function ProPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-brand-red/10 blur-[180px] pointer-events-none" />

      {/* HERO B2B */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="relative mx-auto max-w-7xl px-4 text-center md:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-5 py-2 font-mono text-xs uppercase tracking-widest text-brand-red backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Store className="h-4 w-4" /> Espace Professionnel B2B
          </span>
          <h1 className="mt-6 font-display text-4xl font-light leading-tight tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Développez votre <br className="hidden sm:block" />
            <span className="italic font-serif text-brand-red">Business</span> avec nous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-mono text-xs md:text-sm leading-relaxed text-neutral-400">
            Garages, revendeurs, gestionnaires de flottes de taxi-motos : accédez à des tarifs préférentiels sur l'ensemble de notre catalogue et bénéficiez d'un accompagnement sur-mesure au Bénin.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inscription?type=B2B"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-brand-red/30 bg-brand-red px-8 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black"
            >
              <span>Créer mon compte Pro</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
              [ Avantages Partenaires ]
            </span>
            <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
              Pourquoi devenir partenaire ?
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-light tracking-wide text-white">{b.title}</h3>
                  <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="relative pb-28 pt-8">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red block mb-1 text-center">
              [ Processus d'adhésion ]
            </span>
            <h2 className="text-center font-display text-3xl font-light tracking-wide text-white mb-10">
              Comment ça marche ?
            </h2>

            <div className="space-y-4">
              {[
                "Créez votre compte en sélectionnant le type 'Professionnel'.",
                "Fournissez vos informations légales (Registre de commerce, IFU).",
                "Notre équipe valide votre dossier sous 24h ouvrées.",
                "Accédez immédiatement à vos prix B2B exclusifs et tableaux de bord dédiés."
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md transition-all hover:border-brand-red/40">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red font-mono text-xs font-bold text-white shadow-md shadow-brand-red/30">
                    {i + 1}
                  </span>
                  <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/inscription?type=B2B" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-colors hover:text-white">
                <span>Commencer maintenant</span> <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}