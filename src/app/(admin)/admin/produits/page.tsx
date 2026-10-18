import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/products-table";

export const metadata: Metadata = {
  title: "Produits | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.product.count(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Gestion du Stock & Catalogue ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Produits
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Gérez l'ensemble de votre catalogue : ajustez les prix segmentés, surveillez les niveaux de stock et gérez vos références.
        </p>
      </div>

      {/* TABLEAU COMPLET ET FILTRES GLASSMORPHISM */}
      <ProductsTable
        initialProducts={products}
        initialTotal={total}
        categories={categories}
      />
    </div>
  );
}