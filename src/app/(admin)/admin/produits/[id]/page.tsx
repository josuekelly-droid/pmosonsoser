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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Modifier le produit
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">{product.name}</p>
      </div>

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