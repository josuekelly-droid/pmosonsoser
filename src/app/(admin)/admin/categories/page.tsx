import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = {
  title: "Catégories | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-wide text-white md:text-4xl">
          Catégories
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Gérez les catégories de votre catalogue. Le slug (URL) est généré automatiquement.
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}