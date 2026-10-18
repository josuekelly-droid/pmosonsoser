"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Brand = { id: string; name: string; slug: string };

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nom-asc", label: "Nom (A-Z)" },
  { value: "nom-desc", label: "Nom (Z-A)" },
];

/* ------------------------------------------------------------------ */
/* Hook : centralise la logique URL / filtres                          */
/* ------------------------------------------------------------------ */
function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get("marque") || "";
  const currentSort = searchParams.get("tri") || "recent";
  const currentMin = searchParams.get("min") || "";
  const currentMax = searchParams.get("max") || "";

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      if (!("page" in updates)) params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const apply = useCallback(
    (updates: Record<string, string | null>) => {
      router.push(buildUrl(updates), { scroll: false });
    },
    [buildUrl, router]
  );

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilters =
    !!currentBrand || !!currentMin || !!currentMax || currentSort !== "recent";

  return {
    currentBrand,
    currentSort,
    currentMin,
    currentMax,
    apply,
    reset,
    hasFilters,
  };
}

/* ------------------------------------------------------------------ */
/* Contenu des filtres (partagé sidebar + drawer mobile)               */
/* ------------------------------------------------------------------ */
function FilterContent({
  brands,
  filters,
}: {
  brands: Brand[];
  filters: ReturnType<typeof useFilters>;
}) {
  const { currentBrand, currentMin, currentMax, apply, reset, hasFilters } = filters;
  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);

  useEffect(() => {
    setMinPrice(currentMin);
    setMaxPrice(currentMax);
  }, [currentMin, currentMax]);

  return (
    <div className="space-y-8">
      {/* Marques */}
      <div>
        <h3 className="mb-3 font-display text-lg tracking-wide text-brand-black">
          Marque
        </h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => apply({ marque: null })}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                !currentBrand
                  ? "bg-brand-red/10 font-semibold text-brand-red"
                  : "text-brand-black/70 hover:bg-brand-gray"
              )}
            >
              Toutes les marques
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => apply({ marque: b.slug })}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  currentBrand === b.slug
                    ? "bg-brand-red/10 font-semibold text-brand-red"
                    : "text-brand-black/70 hover:bg-brand-gray"
                )}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Prix */}
      <div>
        <h3 className="mb-3 font-display text-lg tracking-wide text-brand-black">
          Prix (FCFA)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 w-full rounded-lg border border-brand-black/10 bg-white px-3 text-sm outline-none focus:border-brand-red"
          />
          <span className="text-brand-black/40">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 w-full rounded-lg border border-brand-black/10 bg-white px-3 text-sm outline-none focus:border-brand-red"
          />
        </div>
        <button
          onClick={() =>
            apply({ min: minPrice || null, max: maxPrice || null })
          }
          className="mt-3 w-full rounded-lg bg-brand-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-red"
        >
          Appliquer
        </button>
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-black/10 px-4 py-2.5 text-sm font-medium text-brand-black/70 transition hover:bg-brand-gray"
        >
          <X className="h-4 w-4" />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SIDEBAR (desktop / tablette) — uniquement les filtres               */
/* ------------------------------------------------------------------ */
export function CatalogSidebar({
  brands,
  totalCount,
}: {
  brands: Brand[];
  totalCount: number;
}) {
  const filters = useFilters();

  return (
    <aside className="sticky top-28 rounded-2xl border border-brand-black/5 bg-white p-6">
      <div className="mb-6 flex items-center justify-between border-b border-brand-black/5 pb-4">
        <h2 className="font-display text-xl tracking-wide text-brand-black">
          Filtres
        </h2>
        <span className="text-xs text-brand-black/50">
          {totalCount} produit{totalCount > 1 ? "s" : ""}
        </span>
      </div>
      <FilterContent brands={brands} filters={filters} />
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* TOOLBAR (au-dessus de la grille) — bouton filtre mobile + tri        */
/* ------------------------------------------------------------------ */
export function CatalogToolbar({
  brands,
  totalCount,
}: {
  brands: Brand[];
  totalCount: number;
}) {
  const filters = useFilters();
  const { currentSort, apply, hasFilters } = filters;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ---- Barre mobile (< md) ---- */}
      <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-black/10 bg-white px-4 py-2.5 text-sm font-medium text-brand-black shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">
              !
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => apply({ tri: e.target.value })}
            className="appearance-none rounded-full border border-brand-black/10 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-brand-black shadow-sm outline-none focus:border-brand-red"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/50" />
        </div>
      </div>

      {/* ---- Barre desktop (md+) : compteur + tri ---- */}
      <div className="mb-6 hidden items-center justify-between md:flex">
        <p className="text-sm text-brand-black/60">
          <span className="font-semibold text-brand-black">{totalCount}</span>{" "}
          produit{totalCount > 1 ? "s" : ""} trouvé
          {totalCount > 1 ? "s" : ""}
        </p>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => apply({ tri: e.target.value })}
            className="appearance-none rounded-full border border-brand-black/10 bg-white px-5 py-3 pr-10 text-sm font-medium text-brand-black shadow-sm outline-none focus:border-brand-red"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Trier : {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/50" />
        </div>
      </div>

      {/* ---- Drawer mobile (< md) ---- */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide text-brand-black">
                Filtres
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray"
              >
                <X className="h-5 w-5 text-brand-black" />
              </button>
            </div>
            <FilterContent brands={brands} filters={filters} />
          </div>
        </div>
      )}
    </>
  );
}