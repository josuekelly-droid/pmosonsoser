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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 min-h-[70vh]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          
          {/* EN-TÊTE DE RECHERCHE */}
          <div className="mb-12 text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
              [ Moteur de recherche ]
            </span>
            <h1 className="mt-3 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
              Résultats pour <span className="italic font-serif text-brand-red">"{query}"</span>
            </h1>
            <p className="mt-2 font-mono text-xs md:text-sm text-neutral-400">
              {products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""} dans notre catalogue
            </p>
          </div>

          {products.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center rounded-[2.5rem] border border-white/10 bg-neutral-900/40 py-20 px-6 text-center backdrop-blur-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Search className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-light text-white">Aucun résultat trouvé</h2>
              <p className="mt-3 max-w-sm font-mono text-xs md:text-sm text-neutral-400 leading-relaxed">
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
    </div>
  );
}