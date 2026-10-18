import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getIsB2BValidated } from "@/lib/pricing";
import { ProductCard } from "@/components/shop/product-card";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: false }, // On n'indexe pas les pages de recherche
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const isB2B = await getIsB2BValidated();

  const products = query.length >= 2
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { brand: true, category: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <section className="bg-brand-gray py-20 pt-32 min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
            Résultats pour <span className="text-brand-red">"{query}"</span>
          </h1>
          <p className="mt-2 text-sm text-brand-black/60">
            {products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-black/10 bg-white py-20 text-center">
            <Search className="h-12 w-12 text-brand-black/20" />
            <h2 className="mt-4 font-display text-2xl text-brand-black">Aucun résultat</h2>
            <p className="mt-2 max-w-sm text-sm text-brand-black/50">
              Nous n'avons rien trouvé pour "{query}". Essayez de vérifier l'orthographe ou d'utiliser des mots-clés plus généraux.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                priceB2C={p.priceB2C}
                priceB2B={p.priceB2B}
                isB2B={isB2B}
                images={p.images}
                brandName={p.brand.name}
                categoryName={p.category.name}
                stock={p.stock}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}