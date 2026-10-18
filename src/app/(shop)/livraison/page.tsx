import type { Metadata } from "next";
import { Truck, Clock, MapPin, PackageCheck } from "lucide-react";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Livraison & Zones desservies",
  description: "Informations sur les délais, tarifs et zones de livraison de PM Osons Oser au Bénin.",
  pathname: "/livraison",
});

export default function LivraisonPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          
          {/* EN-TÊTE DE SECTION */}
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
              [ Logistique & Expédition ]
            </span>
            <h1 className="mt-3 font-display text-4xl font-light tracking-wide text-white sm:text-5xl">
              Livraison & <span className="italic font-serif text-brand-red">Zones</span>
            </h1>
            <p className="mt-3 font-mono text-xs md:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Nous acheminons vos commandes rapidement et en toute sécurité, partout au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* CARTE DÉLAIS & TARIFS */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Truck className="h-6 w-6" />
              </div>

              <h2 className="font-display text-2xl font-light text-white mb-4">
                Délais & Tarifs
              </h2>

              <ul className="space-y-4 font-mono text-xs md:text-sm text-neutral-300">
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <Clock className="h-4 w-4 shrink-0 text-brand-red mt-0.5" />
                  <span><strong className="text-white font-sans font-medium">Cotonou & environs :</strong> 24h à 48h.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <Clock className="h-4 w-4 shrink-0 text-brand-red mt-0.5" />
                  <span><strong className="text-white font-sans font-medium">Autres villes :</strong> 3 à 5 jours ouvrés.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-red mt-0.5" />
                  <span>Les frais de transport sont calculés en temps réel lors du paiement, en fonction de la distance.</span>
                </li>
              </ul>
            </div>

            {/* CARTE ZONES DESSERVIES */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <PackageCheck className="h-6 w-6" />
              </div>

              <h2 className="font-display text-2xl font-light text-white mb-2">
                Zones desservies
              </h2>
              <p className="font-mono text-xs text-neutral-400 mb-6">
                Nous couvrons l'ensemble du territoire national à travers notre réseau logistique :
              </p>

              <div className="flex flex-wrap gap-2">
                {["Cotonou", "Calavi", "Porto-Novo", "Ouidah", "Abomey", "Parakou", "Natitingou", "Kandi", "Lokossa", "Bohicon"].map((v) => (
                  <span
                    key={v}
                    className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 font-mono text-xs text-neutral-200 backdrop-blur-md"
                  >
                    {v}
                  </span>
                ))}
                <span className="rounded-xl border border-brand-red/30 bg-brand-red/10 px-3.5 py-2 font-mono text-xs font-bold text-brand-red backdrop-blur-md">
                  Et plus...
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}