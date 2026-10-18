import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Produits
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Gérez votre catalogue : ajoutez, modifiez ou supprimez des produits.
        </p>
      </div>

      <ProductsTable
        initialProducts={products}
        initialTotal={total}
        categories={categories}
      />
    </div>
  );
}