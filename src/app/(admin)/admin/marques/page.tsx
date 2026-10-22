import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BrandsManager } from "@/components/admin/brands-manager";

export const metadata: Metadata = {
  title: "Marques | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMarquesPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-wide text-white md:text-4xl">
          Marques
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Gérez les marques disponibles dans votre catalogue.
        </p>
      </div>

      <BrandsManager initialBrands={brands} />
    </div>
  );
}