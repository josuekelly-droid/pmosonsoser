"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { PaymentBadges } from "@/components/shop/payment-badges";

export function CartView() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const updateQty = useCart((s) => s.updateQty);
  const clear = useCart((s) => s.clear);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  /* ---------- PANIER VIDE ---------- */
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-12 text-center backdrop-blur-xl md:p-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-[100px]" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-neutral-400">
          <ShoppingBag className="h-9 w-9" />
        </div>

        <h2 className="mt-6 font-display text-3xl font-light text-white md:text-5xl">
          Votre panier est <span className="italic font-serif font-normal text-neutral-400">vide</span>
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm text-neutral-400 leading-relaxed">
          Explorez notre univers de motos, tricycles, pièces détachées et lubrifiants certifiés.
        </p>

        <Link
          href="/motos"
          className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full bg-brand-red px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black"
        >
          <span>Découvrir le catalogue</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
        </Link>
      </div>
    );
  }

  /* ---------- PANIER REMPLI ---------- */
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      {/* Colonne articles */}
      <div className="space-y-4">
        {/* Barre d'actions haut */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-neutral-900/40 px-6 py-4 backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            <span className="font-bold text-white">{totalItems}</span>{" "}
            article{totalItems > 1 ? "s" : ""} sélectionné{totalItems > 1 ? "s" : ""}
          </p>
          <button
            onClick={clear}
            type="button"
            className="font-mono text-xs text-neutral-500 transition-colors duration-300 hover:text-brand-red"
          >
            Vider le panier
          </button>
        </div>

        {/* Liste des produits */}
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex flex-col gap-5 rounded-3xl border border-white/10 bg-neutral-900/40 p-5 backdrop-blur-xl transition-all duration-500 hover:border-white/20 sm:flex-row sm:items-center"
          >
            {/* Image */}
            <Link
              href={`/produits/${item.id}`}
              className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 sm:h-28 sm:w-28"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-brand-red/20">
                  <span className="font-display text-2xl font-light tracking-wider text-white/30">
                    {item.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Infos produit */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link
                  href={`/produits/${item.id}`}
                  className="line-clamp-2 font-display text-lg font-light text-white transition-colors duration-300 hover:text-brand-red"
                >
                  {item.name}
                </Link>
                <p className="mt-1 font-mono text-xs text-neutral-400">
                  {formatPrice(item.price)} / unité
                </p>
              </div>

              {/* Actions mobiles : quantité + suppression */}
              <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
                <QtySelector
                  qty={item.quantity}
                  max={item.stock}
                  onChange={(q) => updateQty(item.id, q)}
                />
                <button
                  onClick={() => remove(item.id)}
                  type="button"
                  aria-label="Supprimer cet article"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions desktop */}
            <div className="hidden items-center gap-6 sm:flex">
              <QtySelector
                qty={item.quantity}
                max={item.stock}
                onChange={(q) => updateQty(item.id, q)}
              />
              <p className="w-28 text-right font-display text-xl font-light text-white">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => remove(item.id)}
                type="button"
                aria-label="Supprimer cet article"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Prix mobile (bas) */}
            <p className="text-right font-display text-xl font-light text-white sm:hidden">
              {formatPrice(item.price * item.quantity)}
            </p>
          </article>
        ))}

        {/* Continuer mes achats */}
        <div className="pt-2">
          <Link
            href="/motos"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continuer mes achats</span>
          </Link>
        </div>
      </div>

      {/* Colonne récapitulatif */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-7 backdrop-blur-xl">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
            [ Synthèse ]
          </span>
          <h2 className="mt-2 font-display text-2xl font-light text-white">
            Récapitulatif
          </h2>

          <dl className="mt-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <dt className="text-neutral-400">Sous-total</dt>
              <dd className="font-semibold text-white">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between pb-1">
              <dt className="text-neutral-400">Frais de Livraison</dt>
              <dd className="text-right text-[11px] text-neutral-500">
                Calculés à l'étape suivante
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-6">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Total à Régler
            </span>
            <span className="font-display text-3xl font-light text-brand-red">
              {formatPrice(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="group relative mt-8 inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-red font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40"
          >
            <span>Passer à la caisse</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </Link>

          {/* Garanties */}
          <ul className="mt-8 space-y-3 border-t border-white/10 pt-6 font-mono text-xs text-neutral-400">
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-red" />
              <span>Transaction 100% sécurisée (Mobile Money / Carte)</span>
            </li>
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-brand-red" />
              <span>Livraison express partout au Bénin sous 48h</span>
            </li>
          </ul>
        </div>

        {/* Moyens de paiement */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-xl">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Modes de paiement acceptés
          </p>
          <PaymentBadges />
        </div>
      </aside>
    </div>
  );
}

/* ---------- Sélecteur de quantité HUD ---------- */
function QtySelector({
  qty,
  max,
  onChange,
}: {
  qty: number;
  max: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        aria-label="Diminuer la quantité"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="w-8 text-center font-mono text-xs font-bold text-white">
        {qty}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="Augmenter la quantité"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}