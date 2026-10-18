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
    <section className="bg-brand-gray py-20 pt-32">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl tracking-wide text-brand-black">Livraison & Zones</h1>
          <p className="mt-4 text-brand-black/60 max-w-2xl mx-auto">Nous livrons vos commandes rapidement et en toute sécurité, partout au Bénin.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Délais & Tarifs */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-8 shadow-sm">
            <Truck className="h-10 w-10 text-brand-red mb-4" />
            <h2 className="font-display text-2xl text-brand-black">Délais & Tarifs</h2>
            <ul className="mt-4 space-y-4 text-sm text-brand-black/70">
              <li className="flex items-start gap-2"><Clock className="h-4 w-4 shrink-0 text-brand-red mt-0.5" /> <span><strong>Cotonou & environs :</strong> 24h à 48h.</span></li>
              <li className="flex items-start gap-2"><Clock className="h-4 w-4 shrink-0 text-brand-red mt-0.5" /> <span><strong>Autres villes :</strong> 3 à 5 jours ouvrés.</span></li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-red mt-0.5" /> <span>Les frais sont calculés en temps réel sur la carte lors du paiement, en fonction de la distance.</span></li>
            </ul>
          </div>

          {/* Zones desservies */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-8 shadow-sm">
            <PackageCheck className="h-10 w-10 text-brand-red mb-4" />
            <h2 className="font-display text-2xl text-brand-black">Zones desservies</h2>
            <p className="mt-4 text-sm text-brand-black/70">Nous couvrons l'ensemble du territoire national :</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Cotonou", "Calavi", "Porto-Novo", "Ouidah", "Abomey", "Parakou", "Natitingou", "Kandi", "Lokossa", "Bohicon"].map(v => (
                <span key={v} className="rounded-full bg-brand-gray px-3 py-1 text-xs font-medium text-brand-black">{v}</span>
              ))}
              <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-medium text-brand-red">Et plus...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}