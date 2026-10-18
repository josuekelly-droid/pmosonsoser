"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { DeleteProductButton } from "./delete-product-button";

type Product = {
  id: string;
  name: string;
  priceB2C: number;
  stock: number;
  images: string[];
  brand: { name: string };
  category: { name: string; slug: string };
};

type Category = { id: string; name: string };

export function ProductsTable({
  initialProducts,
  initialTotal,
  categories,
}: {
  initialProducts: Product[];
  initialTotal: number;
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (stockFilter) params.set("stock", stockFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, stockFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, stockFilter]);

  return (
    <div className="space-y-6">
      {/* FILTRES + ACTIONS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          {/* Recherche */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="h-12 w-full rounded-full border border-white/10 bg-neutral-900/40 pl-12 pr-5 font-mono text-xs md:text-sm text-white placeholder-neutral-500 outline-none backdrop-blur-md transition-colors focus:border-brand-red"
            />
          </div>

          {/* Catégorie */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 rounded-full border border-white/10 bg-neutral-900/40 px-5 font-mono text-xs uppercase tracking-wider text-white outline-none backdrop-blur-md transition-colors focus:border-brand-red cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-neutral-400">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-12 rounded-full border border-white/10 bg-neutral-900/40 px-5 font-mono text-xs uppercase tracking-wider text-white outline-none backdrop-blur-md transition-colors focus:border-brand-red cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-neutral-400">Tout le stock</option>
            <option value="low" className="bg-neutral-900 text-amber-400">Stock faible (≤5)</option>
            <option value="out" className="bg-neutral-900 text-red-400">En rupture</option>
          </select>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-red/30 bg-brand-red px-7 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all hover:bg-white hover:text-black"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* TABLEAU GLASSMORPHISM */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
              <Package className="h-8 w-8" />
            </div>
            <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400">
              Aucun produit ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Produit
                  </th>
                  <th className="hidden px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 md:table-cell">
                    Marque
                  </th>
                  <th className="hidden px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 lg:table-cell">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Prix B2C
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => {
                  const lowStock = p.stock > 0 && p.stock <= 5;
                  const outOfStock = p.stock === 0;
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            {p.images?.[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-brand-red/10 text-brand-red">
                                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                                  {p.brand.name.slice(0, 3)}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/admin/produits/${p.id}`}
                            className="line-clamp-2 font-sans text-sm font-medium text-white transition-colors hover:text-brand-red"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className="font-mono text-xs text-neutral-300">
                          {p.brand.name}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-300 backdrop-blur-md">
                          {p.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-display text-lg font-light tracking-wide text-white">
                          {formatPrice(p.priceB2C)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-xs font-semibold backdrop-blur-md",
                            outOfStock
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : lowStock
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          )}
                        >
                          {lowStock && <AlertTriangle className="h-3 w-3" />}
                          <span>{p.stock}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produits/${p.id}`}
                            aria-label="Modifier le produit"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 transition-all hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteProductButton
                            productId={p.id}
                            productName={p.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="font-mono text-xs text-neutral-400">
            {total} produit{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-900/40 text-white backdrop-blur-md transition-all hover:border-brand-red/50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs text-neutral-300">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-900/40 text-white backdrop-blur-md transition-all hover:border-brand-red/50 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}