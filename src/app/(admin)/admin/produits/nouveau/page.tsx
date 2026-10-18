import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Nouveau produit | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NouveauProduitPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Nouveautés Catalogue ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Nouveau produit
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Renseignez les caractéristiques de la référence, la tarification segmentée (B2C / B2B) et importez vos médias visuels.
        </p>
      </div>

      {/* FORMULAIRE DE CRÉATION PRODUIT */}
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}