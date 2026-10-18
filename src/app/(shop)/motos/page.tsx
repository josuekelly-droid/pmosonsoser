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
  return generateCatalogMetadata(CATALOG_CONFIGS.motos, params, page);
}

export default async function MotosPage({ searchParams }: Props) {
  const params = await searchParams;
  return <CatalogPage config={CATALOG_CONFIGS.motos} searchParams={params} />;
}