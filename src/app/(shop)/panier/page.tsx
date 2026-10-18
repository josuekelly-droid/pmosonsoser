import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = constructMetadata({
  title: "Mon panier",
  description:
    "Consultez et finalisez votre commande chez PM Osons Oser : motos, tricycles, pièces détachées et lubrifiants.",
  pathname: "/panier",
  noIndex: true, // pas d'indexation Google
});

export default function PanierPage() {
  return (
    <>
      {/* HERO */}
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
            <span className="text-white">Panier</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
            Mon panier
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60">
            Vérifiez vos articles avant de passer commande.
          </p>
        </div>
      </section>

      {/* CONTENU */}
      <section className="bg-brand-gray py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <CartView />
        </div>
      </section>
    </>
  );
}