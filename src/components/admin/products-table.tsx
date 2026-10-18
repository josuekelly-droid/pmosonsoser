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
    <div className="space-y-5">
      {/* Filtres + actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          {/* Recherche */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="h-11 w-full rounded-full border border-brand-black/10 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-brand-red"
            />
          </div>

          {/* Catégorie */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 rounded-full border border-brand-black/10 bg-white px-4 text-sm outline-none transition focus:border-brand-red"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-11 rounded-full border border-brand-black/10 bg-white px-4 text-sm outline-none transition focus:border-brand-red"
          >
            <option value="">Tout le stock</option>
            <option value="low">Stock faible (≤5)</option>
            <option value="out">Rupture</option>
          </select>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-red px-5 text-sm font-semibold text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90"
        >
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-black/5 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-brand-black/20" />
            <p className="mt-3 text-sm text-brand-black/50">
              Aucun produit ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-black/5 bg-brand-gray/40">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Produit
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50 md:table-cell">
                  Marque
                </th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50 lg:table-cell">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const lowStock = p.stock > 0 && p.stock <= 5;
                const outOfStock = p.stock === 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-brand-black/5 last:border-0 transition hover:bg-brand-gray/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-brand-gray">
                          {p.images?.[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-black to-brand-red/30">
                              <span className="font-display text-[10px] tracking-wider text-white/60">
                                {p.brand.name.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/admin/produits/${p.id}`}
                          className="line-clamp-2 text-sm font-medium text-brand-black transition hover:text-brand-red"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-brand-black/70">
                        {p.brand.name}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="rounded-full bg-brand-gray px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-black/60">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-display text-base text-brand-black">
                        {formatPrice(p.priceB2C)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          outOfStock
                            ? "bg-red-100 text-red-700"
                            : lowStock
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {lowStock && <AlertTriangle className="h-3 w-3" />}
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/produits/${p.id}`}
                          aria-label="Modifier"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-black/40 transition hover:bg-brand-red/10 hover:text-brand-red"
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-brand-black/50">
            {total} produit{total > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-black/10 bg-white text-brand-black transition hover:border-brand-red disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-brand-black/60">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-black/10 bg-white text-brand-black transition hover:border-brand-red disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}