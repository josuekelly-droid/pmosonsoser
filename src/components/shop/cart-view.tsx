"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
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
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-black/10 bg-white py-20 text-center md:py-28">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gray">
          <ShoppingBag className="h-9 w-9 text-brand-black/30" />
        </div>
        <h2 className="mt-6 font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Votre panier est vide
        </h2>
        <p className="mt-3 max-w-sm text-sm text-brand-black/60">
          Parcourez notre catalogue et ajoutez vos produits préférés.
        </p>
        <Link
          href="/motos"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90"
        >
          Découvrir le catalogue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        <div className="flex items-center justify-between rounded-2xl border border-brand-black/5 bg-white px-5 py-4">
          <p className="text-sm text-brand-black/70">
            <span className="font-semibold text-brand-black">
              {totalItems}
            </span>{" "}
            article{totalItems > 1 ? "s" : ""} dans votre panier
          </p>
          <button
            onClick={clear}
            className="text-xs font-medium text-brand-black/50 transition hover:text-brand-red"
          >
            Tout supprimer
          </button>
        </div>

        {/* Liste */}
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-brand-black/5 bg-white p-4 transition hover:border-brand-red/20 sm:flex-row sm:items-center sm:p-5"
          >
            {/* Image */}
            <Link
              href={`/produits/${item.id}`}
              className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-brand-gray sm:h-24 sm:w-24"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-black to-brand-red/30">
                  <span className="font-display text-2xl tracking-wider text-white/40">
                    {item.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Infos */}
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/produits/${item.id}`}
                className="line-clamp-2 text-sm font-semibold text-brand-black transition hover:text-brand-red"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-xs text-brand-black/50">
                {formatPrice(item.price)} / unité
              </p>

              {/* Actions mobiles : quantité + suppression */}
              <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                <QtySelector
                  qty={item.quantity}
                  max={item.stock}
                  onChange={(q) => updateQty(item.id, q)}
                />
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Supprimer"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-brand-black/40 transition hover:bg-red-50 hover:text-red-600"
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
              <p className="w-24 text-right font-display text-lg text-brand-black">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => remove(item.id)}
                aria-label="Supprimer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black/40 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Prix mobile (bas) */}
            <p className="text-right font-display text-lg text-brand-black sm:hidden">
              {formatPrice(item.price * item.quantity)}
            </p>
          </article>
        ))}

        {/* Continuer achats */}
        <Link
          href="/motos"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-black/70 transition hover:text-brand-red"
        >
          <ArrowLeft className="h-4 w-4" />
          Continuer mes achats
        </Link>
      </div>

      {/* Colonne récap */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-7">
          <h2 className="font-display text-2xl tracking-wide text-brand-black">
            Récapitulatif
          </h2>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-brand-black/60">Sous-total</dt>
              <dd className="font-medium text-brand-black">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-brand-black/60">Livraison</dt>
              <dd className="text-right text-xs text-brand-black/60">
                Calculée à l'étape suivante
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-end justify-between border-t border-brand-black/10 pt-6">
            <span className="font-display text-lg tracking-wide text-brand-black">
              Total
            </span>
            <span className="font-display text-3xl tracking-wide text-brand-red">
              {formatPrice(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-red text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90"
          >
            Passer la commande
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Garanties */}
          <ul className="mt-6 space-y-3 border-t border-brand-black/5 pt-6 text-xs text-brand-black/60">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-red" />
              Paiement 100% sécurisé
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-brand-red" />
              Livraison partout au Bénin
            </li>
          </ul>
        </div>

        {/* Moyens de paiement */}
        <div className="mt-6 rounded-2xl border border-brand-black/5 bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-black/50">
            Moyens de paiement acceptés
          </p>
          <PaymentBadges />
        </div>
      </aside>
    </div>
  );
}

/* ---------- Sélecteur quantité ---------- */
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
    <div className="flex items-center rounded-full border border-brand-black/10 bg-white">
      <button
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        aria-label="Diminuer"
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black transition hover:bg-brand-gray disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center text-sm font-semibold text-brand-black">
        {qty}
      </span>
      <button
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="Augmenter"
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-black transition hover:bg-brand-gray disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}