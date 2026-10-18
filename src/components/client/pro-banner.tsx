import Link from "next/link";
import { Store, TrendingUp, ArrowUpRight, Crown, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Props = {
  savingsTotal: number;
  proOrdersCount: number;
};

export function ProBanner({ savingsTotal, proOrdersCount }: Props) {
  return (
    <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-brand-red/30 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-red/15 blur-[120px]" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* Badge statut B2B */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Crown className="h-3.5 w-3.5 shrink-0" />
            <span>Compte Professionnel Validé</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <h2 className="mt-4 font-display text-3xl font-light text-white md:text-4xl lg:text-5xl">
            Bienvenue dans l'espace <span className="italic font-serif text-brand-red">Pro</span>
          </h2>
          
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
            Vous bénéficiez des tarifs grossistes préférentiels et d'un accompagnement dédié sur l'ensemble de notre catalogue.
          </p>
        </div>

        {/* METRIQUES HUD */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Économies */}
          <div className="min-w-[140px] flex-1 rounded-2xl border border-white/10 bg-black/40 p-4 text-center backdrop-blur-md">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-500 block">
              Économies Réalisées
            </span>
            <p className="mt-1 font-display text-2xl font-light text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              {formatPrice(savingsTotal)}
            </p>
          </div>

          {/* Commandes Pro */}
          <div className="min-w-[140px] flex-1 rounded-2xl border border-white/10 bg-black/40 p-4 text-center backdrop-blur-md">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-500 block">
              Commandes Pro
            </span>
            <p className="mt-1 font-display text-2xl font-light text-white">
              {proOrdersCount < 10 ? `0${proOrdersCount}` : proOrdersCount}
            </p>
          </div>
        </div>
      </div>

      {/* RAPPEL DES AVANTAGES PRO */}
      <div className="relative z-10 mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-6 font-mono text-xs uppercase tracking-widest text-neutral-400">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-brand-red" />
          <span>Prix dégressifs appliqués</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-brand-red" />
          <span>Livraison prioritaire</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-brand-red" />
          <span>Facturation B2B & TVA</span>
        </div>
      </div>
    </div>
  );
}