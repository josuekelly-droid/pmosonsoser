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
    <>
      <section className="relative overflow-hidden bg-brand-black pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="pointer-events-none absolute -top-32 right-0 h-[300px] w-[400px] rounded-full bg-brand-red/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-1.5 text-xs text-white/50"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/panier" className="transition-colors hover:text-white">
              Panier
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Commande</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
            Finaliser la commande
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60">
            Dernière étape avant la livraison.
          </p>
        </div>
      </section>

      <section className="bg-brand-gray py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <CheckoutForm />
        </div>
      </section>
    </>
  );
}