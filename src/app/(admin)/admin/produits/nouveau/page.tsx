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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Nouveau produit
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Remplissez les informations du nouveau produit.
        </p>
      </div>

      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}