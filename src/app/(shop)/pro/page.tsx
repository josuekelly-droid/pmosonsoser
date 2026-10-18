import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Store, TrendingUp, Truck, ShieldCheck, Headphones, CheckCircle2 } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Devenir Partenaire B2B",
  description: "Rejoignez le réseau PM Osons Oser. Prix dégressifs sur les motos, pièces détachées et lubrifiants pour les professionnels.",
  pathname: "/pro",
});

const BENEFITS = [
  { icon: TrendingUp, title: "Prix dégressifs", desc: "Jusqu'à -15% sur tout le catalogue selon vos volumes d'achat." },
  { icon: Truck, title: "Livraison prioritaire", desc: "Vos commandes sont traitées et livrées en priorité." },
  { icon: ShieldCheck, title: "Compte validé", desc: "Un accès sécurisé après validation de vos documents professionnels." },
  { icon: Headphones, title: "Support dédié", desc: "Un interlocuteur unique pour toutes vos demandes." },
];

export default function ProPage() {
  return (
    <>
      {/* HERO B2B */}
      <section className="relative overflow-hidden bg-brand-black pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center md:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-red">
            <Store className="h-4 w-4" /> Espace Professionnel
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Développez votre <br className="hidden sm:block" />
            <span className="text-brand-red">Business</span> avec nous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/60 md:text-lg">
            Garages, revendeurs, flottes de taxi-motos : accédez à des tarifs préférentiels sur l'ensemble de notre catalogue et bénéficiez d'un service sur mesure.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inscription?type=B2B"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90"
            >
              Créer mon compte Pro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
              Pourquoi devenir partenaire ?
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-3xl border border-brand-black/5 bg-brand-gray/30 p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-xl tracking-wide text-brand-black">{b.title}</h3>
                  <p className="mt-2 text-sm text-brand-black/60">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-brand-gray py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <h2 className="text-center font-display text-3xl tracking-wide text-brand-black">
            Comment ça marche ?
          </h2>
          <div className="mt-10 space-y-6">
            {[
              "Créez votre compte en sélectionnant 'Professionnel'.",
              "Fournissez vos informations (Registre de commerce, IFU).",
              "Notre équipe valide votre compte sous 24h.",
              "Accédez immédiatement à vos prix B2B exclusifs."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-brand-black/5 bg-white p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-brand-black">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/inscription?type=B2B" className="inline-flex items-center gap-2 text-brand-red font-semibold hover:underline">
              Commencer maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}