import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
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
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-3.5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-red/40 hover:bg-neutral-900/80 hover:shadow-[0_20px_40px_rgba(239,68,68,0.12)]"
    >
      {/* CADRE VISUEL PRODUIT */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-black/50">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-85 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-brand-red/20">
            <span className="font-display text-3xl font-extralight tracking-widest text-white/20">
              {brandName.toUpperCase().slice(0, 3)}
            </span>
          </div>
        )}

        {/* OVERLAY DE FONDU */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />

        {/* BADGE MARQUE (HAUT GAUCHE - SÉCURISÉ CONTRE LES CHEVAUCHEMENTS) */}
        <div className="absolute left-3 top-3 z-10 max-w-[65%]">
          <span className="inline-block truncate rounded-full border border-white/10 bg-neutral-950/70 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-300 backdrop-blur-md">
            {brandName}
          </span>
        </div>

        {/* BADGE PRIX PRO B2B (HAUT DROITE) */}
        {hasB2BPrice && (
          <div className="absolute right-3 top-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>Prix Pro</span>
            </span>
          </div>
        )}

        {/* BADGE RUPTURE (BAS DROITE) */}
        {!inStock && (
          <span className="absolute right-3 bottom-3 z-10 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-red-400 backdrop-blur-md">
            Rupture
          </span>
        )}

        {/* BOUTON Révélation au survol (BAS DROITE si en stock) */}
        {inStock && (
          <div className="absolute right-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-black">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </div>
        )}
      </div>

      {/* INFORMATIONS ET CONTENU */}
      <div className="flex flex-1 flex-col p-2.5 pt-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">
          {categoryName}
        </span>

        <h3 className="mt-1.5 line-clamp-2 font-display text-base font-light leading-snug text-white transition-colors duration-300 group-hover:text-neutral-200">
          {name}
        </h3>

        {/* AFFICHAGE TARIF */}
        <div className="mt-auto border-t border-white/5 pt-4">
          {hasB2BPrice ? (
            <div className="flex flex-col">
              <span className="font-mono text-xs text-neutral-500 line-through">
                {formatPrice(priceB2C)}
              </span>
              <span className="font-display text-xl font-light text-brand-red">
                {formatPrice(displayPrice!)}
              </span>
            </div>
          ) : (
            <span className="font-display text-xl font-light text-white">
              {formatPrice(displayPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}