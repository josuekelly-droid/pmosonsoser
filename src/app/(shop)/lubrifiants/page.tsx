import type { Metadata } from "next";
import {
  CATALOG_CONFIGS,
  CatalogPage,
  generateCatalogMetadata,
} from "@/components/shop/catalog-page";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return generateCatalogMetadata(CATALOG_CONFIGS.lubrifiants, params, page);
}

export default async function LubrifiantsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-brand-red/10 blur-[180px] pointer-events-none" />

      {/* Composant principal du catalogue de lubrifiants */}
      <div className="relative z-10">
        <CatalogPage config={CATALOG_CONFIGS.lubrifiants} searchParams={params} />
      </div>
    </div>
  );
}