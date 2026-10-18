"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Loader2, ChevronRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  telephone: string;
  total: number;
  statut: string;
  methodePaiement: string;
  createdAt: Date;
};

const PAYMENT_LABELS: Record<string, string> = {
  FEDAPAY: "Mobile Money",
  WESTERN_UNION: "Western Union",
  VIREMENT: "Virement",
};

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders] = useState(initialOrders);
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.statut === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.telephone.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* FILTRES & RECHERCHE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, nom, téléphone…"
            className="h-12 w-full rounded-full border border-white/10 bg-neutral-900/40 pl-12 pr-5 font-mono text-xs md:text-sm text-white placeholder-neutral-500 outline-none backdrop-blur-md transition-colors focus:border-brand-red"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={cn(
              "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300",
              !statusFilter
                ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30"
                : "border-white/10 bg-neutral-900/40 text-neutral-400 backdrop-blur-md hover:border-brand-red/50 hover:text-white"
            )}
          >
            Toutes ({orders.length})
          </button>
          {ORDER_STATUSES.map((s) => {
            const count = orders.filter((o) => o.statut === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300",
                  statusFilter === s
                    ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30"
                    : "border-white/10 bg-neutral-900/40 text-neutral-400 backdrop-blur-md hover:border-brand-red/50 hover:text-white"
                )}
              >
                {STATUS_LABELS[s as OrderStatus]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLEAU GLASSMORPHISM */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400">
              Aucune commande ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Commande
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Paiement
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Total
                  </th>
                  <th className="w-12 px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/commandes/${o.id}`}
                        className="font-mono text-sm font-bold text-white transition-colors hover:text-brand-red"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-white">
                        {o.customerName}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                        {o.telephone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur-md">
                        {PAYMENT_LABELS[o.methodePaiement] || o.methodePaiement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-xl px-3 py-1 font-mono text-[10px] uppercase tracking-wider border backdrop-blur-md",
                          STATUS_STYLES[o.statut as OrderStatus] ||
                            "border-white/10 bg-white/5 text-neutral-300"
                        )}
                      >
                        {STATUS_LABELS[o.statut as OrderStatus] || o.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-display text-lg font-light tracking-wide text-white">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/commandes/${o.id}`}
                        aria-label="Voir la commande"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 transition-all hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}