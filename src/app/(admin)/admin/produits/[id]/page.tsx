import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Modifier un produit | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Gestion du catalogue ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Modifier le produit
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl truncate">
          Référence active : <span className="text-white font-medium">{product.name}</span>
        </p>
      </div>

      {/* FORMULAIRE DE MODIFICATION PRODUIT */}
      <ProductForm
        mode="edit"
        categories={categories}
        brands={brands}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description || "",
          priceB2C: product.priceB2C,
          priceB2B: product.priceB2B,
          stock: product.stock,
          images: product.images,
          categoryId: product.categoryId,
          brandId: product.brandId,
        }}
      />
    </div>
  );
}