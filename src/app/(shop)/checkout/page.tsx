import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = constructMetadata({
  title: "Finaliser ma commande",
  description: "Renseignez vos informations de livraison et choisissez votre moyen de paiement.",
  pathname: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      {/* EN-TÊTE & FIL D'ARIANE */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 text-brand-red" />
            <Link href="/panier" className="transition-colors hover:text-white">
              Panier
            </Link>
            <ChevronRight className="h-3 w-3 text-brand-red" />
            <span className="text-white">Commande</span>
          </nav>

          <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
            [ Tunnel d'achat ]
          </span>
          <h1 className="mt-1 font-display text-4xl font-light tracking-wide text-white sm:text-5xl md:text-6xl">
            Finaliser la <span className="italic font-serif text-brand-red">commande</span>
          </h1>
          <p className="mt-2 font-mono text-xs md:text-sm text-neutral-400">
            Dernière étape avant la validation et l'expédition de votre sélection.
          </p>
        </div>
      </section>

      {/* FORMULAIRE DE CHECKOUT */}
      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <CheckoutForm />
        </div>
      </section>
    </div>
  );
}