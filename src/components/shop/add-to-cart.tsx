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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">
          Produit momentanément indisponible
        </p>
        <p className="mt-1 text-xs text-red-600/80">
          Contactez-nous pour être prévenu dès le réapprovisionnement.
        </p>
        <button
          onClick={handleShare}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <Share2 className="h-3.5 w-3.5" />
          Partager ce produit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions secondaires (favoris + partage) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSaved((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition",
            saved
              ? "border-brand-red bg-brand-red/10 text-brand-red"
              : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-red/30 hover:text-brand-black"
          )}
        >
          <Heart
            className={cn("h-3.5 w-3.5", saved && "fill-brand-red text-brand-red")}
          />
          {saved ? "Sauvegardé" : "Sauvegarder"}
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-brand-black/10 bg-white px-4 py-2 text-xs font-medium text-brand-black/70 transition hover:border-brand-red/30 hover:text-brand-black"
        >
          <Share2 className="h-3.5 w-3.5" />
          Partager
        </button>
      </div>

      {/* Sélecteur quantité */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-black/5 bg-brand-gray/50 p-2">
        <span className="pl-3 text-sm font-medium text-brand-black">
          Quantité
        </span>
        <div className="flex items-center rounded-full border border-brand-black/10 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Diminuer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black transition hover:bg-brand-gray disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-brand-black">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Augmenter"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black transition hover:bg-brand-gray disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bouton principal */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className={cn(
            "group inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-sm font-semibold uppercase tracking-wider text-white shadow-xl transition-all",
            added
              ? "bg-green-600 shadow-green-600/30"
              : "bg-brand-red shadow-brand-red/30 hover:bg-brand-red/90 hover:shadow-2xl hover:shadow-brand-red/40"
          )}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>

      {/* Achat express */}
      <button
        onClick={handleAdd}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-brand-black bg-white text-sm font-semibold uppercase tracking-wider text-brand-black transition hover:bg-brand-black hover:text-white"
      >
        <Zap className="h-4 w-4 transition group-hover:fill-brand-red group-hover:text-brand-red" />
        Achat express
      </button>
    </div>
  );
}