"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
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
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Numéro, nom, téléphone…"
            className="h-11 w-full rounded-full border border-brand-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-brand-red"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-medium transition",
              !statusFilter
                ? "border-brand-red bg-brand-red text-white"
                : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-red/30"
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
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  statusFilter === s
                    ? "border-brand-red bg-brand-red text-white"
                    : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-red/30"
                )}
              >
                {STATUS_LABELS[s as OrderStatus]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-black/5 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-brand-black/20" />
            <p className="mt-3 text-sm text-brand-black/50">
              Aucune commande ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-brand-black/5 bg-brand-gray/40">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Paiement
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Total
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-brand-black/5 last:border-0 transition hover:bg-brand-gray/20"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commandes/${o.id}`}
                        className="text-sm font-semibold text-brand-black transition hover:text-brand-red"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="text-[11px] text-brand-black/50">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-brand-black">
                        {o.customerName}
                      </p>
                      <p className="text-[11px] text-brand-black/50">
                        {o.telephone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-gray px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-black/70">
                        {PAYMENT_LABELS[o.methodePaiement] || o.methodePaiement}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                          STATUS_STYLES[o.statut as OrderStatus] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {STATUS_LABELS[o.statut as OrderStatus] || o.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-display text-base tracking-wide text-brand-black">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commandes/${o.id}`}
                        aria-label="Voir"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-black/40 transition hover:bg-brand-red/10 hover:text-brand-red"
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