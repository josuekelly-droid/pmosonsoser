import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Conditions Générales de Vente (CGV)",
  pathname: "/cgv",
});

export default function CGVPage() {
  return (
    <section className="bg-brand-gray py-20 pt-32">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h1 className="font-display text-4xl tracking-wide text-brand-black mb-8">Conditions Générales de Vente</h1>
        
        <div className="prose prose-gray max-w-none rounded-3xl border border-brand-black/5 bg-white p-8 md:p-12 shadow-sm">
          <p className="text-sm text-brand-black/50 mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">1. Objet</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre PM Osons Oser (le Vendeur) et toute personne effectuant un achat sur le site pmosonsoser.com (le Client).</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">2. Produits et Prix</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Les produits proposés sont ceux qui figurent sur le site au moment de la consultation. Les prix sont indiqués en Francs CFA (FCFA). PM Osons Oser se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">3. Commandes</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Le Client passe commande via notre plateforme sécurisée. La validation de la commande implique l'acceptation des présentes CGV. Une confirmation est envoyée par email au Client.</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">4. Paiement</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Le paiement s'effectue en ligne par Mobile Money (FedaPay), par virement bancaire ou par Western Union. La commande ne sera traitée qu'après confirmation effective du paiement par nos services.</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">5. Livraison</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Les produits sont livrés dans les zones desservies par PM Osons Oser. Les frais de livraison sont calculés en fonction de la distance. Les délais de livraison sont donnés à titre indicatif (24h à 48h pour Cotonou et environs).</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">6. Retours et Garantie</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Tout produit non utilisé peut faire l'objet d'un retour sous 7 jours. Les véhicules et pièces détachées bénéficient des garanties constructeur ou de nos garanties spécifiques. Contactez notre SAV en cas de problème.</p>

          <h2 className="text-xl font-display tracking-wide text-brand-black mt-8 mb-3">7. Litiges</h2>
          <p className="text-brand-black/70 text-sm leading-relaxed">Tout litige relatif à l'interprétation ou à l'exécution des présentes CGV sera soumis aux tribunaux compétents de Cotonou, Bénin.</p>
        </div>
      </div>
    </section>
  );
}