import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ColorsManager } from "@/components/admin/colors-manager";

export const metadata: Metadata = {
  title: "Couleurs | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCouleursPage() {
  const colors = await prisma.color.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-wide text-white md:text-4xl">
          Palette de couleurs
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Gérez les couleurs disponibles pour vos produits.
        </p>
      </div>

      <ColorsManager initialColors={colors} />
    </div>
  );
}