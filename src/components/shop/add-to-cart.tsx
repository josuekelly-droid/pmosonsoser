"use client";

import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Zap,
  Heart,
  Share2,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    name: string;
    priceB2C: number;
    images: string[];
    stock: number;
  };
};

export function AddToCart({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const add = useCart((s) => s.add);

  const outOfStock = product.stock <= 0;
  const maxQty = Math.min(product.stock, 10);

  useEffect(() => {
    if (qty > product.stock) setQty(product.stock || 1);
  }, [product.stock, qty]);

  function handleAdd() {
    if (outOfStock) return;
    add(
      {
        id: product.id,
        name: product.name,
        price: product.priceB2C,
        image: product.images?.[0],
        stock: product.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Découvrez ${product.name} chez PM Osons Oser`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (outOfStock) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-red-400">
              Rupture de Stock
            </h4>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Ce produit est temporairement indisponible. Contactez notre équipe pour être informé dès le réapprovisionnement.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleShare}
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-all duration-300 hover:border-white/30 hover:bg-white/10"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Partager la fiche produit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ACTIONS SECONDAIRES (FAVORIS + PARTAGE) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest backdrop-blur-md transition-all duration-300",
            saved
              ? "border-brand-red bg-brand-red/10 text-brand-red"
              : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/30 hover:text-white"
          )}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110",
              saved ? "fill-brand-red text-brand-red" : "text-current"
            )}
          />
          <span>{saved ? "Sauvegardé" : "Favoris"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neutral-400 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:text-white"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Partager</span>
        </button>
      </div>

      {/* SÉLECTEUR DE QUANTITÉ HUD */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-2.5 backdrop-blur-xl">
        <span className="pl-3 font-mono text-xs uppercase tracking-widest text-neutral-400">
          Quantité
        </span>
        <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Diminuer la quantité"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          
          <span className="w-10 text-center font-mono text-sm font-bold text-white">
            {qty}
          </span>

          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Augmenter la quantité"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* BOUTON PRINCIPAL D'AJOUT AU PANIER */}
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          "group relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all duration-500",
          added
            ? "bg-emerald-600 shadow-emerald-600/30"
            : "bg-brand-red shadow-brand-red/25 hover:bg-white hover:text-black hover:shadow-brand-red/40"
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            <span>Ajouté avec succès</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
            <span>Ajouter au panier</span>
          </>
        )}
      </button>

      {/* BOUTON ACHAT EXPRESS */}
      <button
        type="button"
        onClick={handleAdd}
        className="group relative inline-flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/5 font-mono text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:border-white hover:bg-white hover:text-black"
      >
        <Zap className="h-4 w-4 text-brand-red transition-colors duration-500 group-hover:text-black" />
        <span>Commander Immédiatement</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
      </button>
    </div>
  );
}