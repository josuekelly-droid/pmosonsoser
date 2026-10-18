import Link from "next/link";
import { Store, TrendingUp, ArrowRight, Crown, Truck, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Props = {
  savingsTotal: number;
  proOrdersCount: number;
};

export function ProBanner({ savingsTotal, proOrdersCount }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-red/20 bg-gradient-to-br from-brand-black via-brand-black to-brand-red/20 p-6 md:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/30 blur-3xl" />
      
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-red">
            <Crown className="h-3 w-3" />
            Compte Professionnel Validé
          </div>
          <h2 className="mt-4 font-display text-3xl tracking-wide text-white md:text-4xl">
            Bienvenue dans l'espace <span className="text-brand-red">Pro</span>
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/60">
            Vous bénéficiez de prix dégressifs sur l'ensemble du catalogue. Profitez-en !
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Économies</p>
            <p className="mt-1 font-display text-2xl text-green-400">
              {formatPrice(savingsTotal)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Commandes Pro</p>
            <p className="mt-1 font-display text-2xl text-white">
              {proOrdersCount}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <TrendingUp className="h-3.5 w-3.5 text-brand-red" />
          Prix dégressifs sur tout le catalogue
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Truck className="h-3.5 w-3.5 text-brand-red" />
          Livraison prioritaire
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
          Factures professionnelles
        </div>
      </div>
    </div>
  );
}