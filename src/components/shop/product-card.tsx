import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  id: string;
  name: string;
  priceB2C: number;
  priceB2B?: number | null;
  images: string[];
  brandName: string;
  categoryName: string;
  stock: number;
  isB2B?: boolean;
};

export function ProductCard({
  id,
  name,
  priceB2C,
  priceB2B,
  images,
  brandName,
  categoryName,
  stock,
  isB2B,
}: ProductCardProps) {
  const inStock = stock > 0;
  
  // Logique de prix B2B
  const hasB2BPrice = isB2B && priceB2B && priceB2B > 0;
  const displayPrice = hasB2BPrice ? priceB2B : priceB2C;

  return (
    <Link
      href={`/produits/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-black/5 bg-white transition-all hover:-translate-y-1 hover:border-brand-red/20 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-gray">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-black to-brand-red/30">
            <span className="font-display text-4xl tracking-wider text-white/30">
              {brandName.toUpperCase().slice(0, 3)}
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-brand-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          {brandName}
        </span>

        {/* Badge Prix Pro */}
        {hasB2BPrice && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg">
            Prix Pro
          </span>
        )}

        {!inStock && (
          <span className="absolute right-3 bottom-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Rupture
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] uppercase tracking-widest text-brand-red">
          {categoryName}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-brand-black">
          {name}
        </h3>
        
        {/* Affichage du prix */}
        <div className="mt-auto pt-3">
          {hasB2BPrice ? (
            <div className="flex flex-col">
              <span className="text-xs text-brand-black/40 line-through">
                {formatPrice(priceB2C)}
              </span>
              <span className="font-display text-lg text-brand-red">
                {formatPrice(displayPrice!)}
              </span>
            </div>
          ) : (
            <span className="font-display text-lg text-brand-black">
              {formatPrice(displayPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}