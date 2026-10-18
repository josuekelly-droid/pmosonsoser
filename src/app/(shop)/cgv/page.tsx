import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Conditions Générales de Vente (CGV)",
  pathname: "/cgv",
});

export default function CGVPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          
          {/* En-tête de section */}
          <div className="mb-10 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
              [ Juridique ]
            </span>
            <h1 className="mt-3 font-display text-4xl font-light tracking-wide text-white sm:text-5xl">
              Conditions Générales de <span className="italic font-serif text-brand-red">Vente</span>
            </h1>
          </div>
          
          {/* Conteneur principal Glassmorphism */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-12">
            <p className="font-mono text-xs text-neutral-400 mb-8 pb-6 border-b border-white/10">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>

            <div className="space-y-8 font-mono text-xs md:text-sm text-neutral-300 leading-relaxed">
              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  1. Objet
                </h2>
                <p>
                  Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre PM Osons Oser (le Vendeur) et toute personne effectuant un achat sur le site pmosonsoser.com (le Client).
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  2. Produits et Prix
                </h2>
                <p>
                  Les produits proposés sont ceux qui figurent sur le site au moment de la consultation. Les prix sont indiqués en Francs CFA (FCFA). PM Osons Oser se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  3. Commandes
                </h2>
                <p>
                  Le Client passe commande via notre plateforme sécurisée. La validation de la commande implique l'acceptation entière et sans réserve des présentes CGV. Une confirmation officielle est envoyée par email au Client.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  4. Paiement
                </h2>
                <p>
                  Le paiement s'effectue en ligne par Mobile Money (FedaPay), par virement bancaire ou par Western Union. La commande ne sera traitée et validée qu'après confirmation effective du règlement par nos services financiers.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  5. Livraison
                </h2>
                <p>
                  Les produits sont livrés dans les zones géographiques desservies par PM Osons Oser au Bénin. Les frais de livraison sont calculés en fonction de la distance. Les délais de livraison sont donnés à titre indicatif (24h à 48h pour Cotonou et ses environs).
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  6. Retours et Garantie
                </h2>
                <p>
                  Tout produit non utilisé peut faire l'objet d'un retour sous 7 jours ouvrés. Les véhicules et pièces détachées bénéficient des garanties constructeur ou de nos garanties spécifiques. Contactez notre service après-vente (SAV) en cas de réclamation.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                  7. Litiges
                </h2>
                <p>
                  Tout litige relatif à l'interprétation ou à l'exécution des présentes CGV sera soumis à une conciliation amiable, à défaut de quoi les tribunaux compétents de Cotonou (Bénin) seront saisis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}