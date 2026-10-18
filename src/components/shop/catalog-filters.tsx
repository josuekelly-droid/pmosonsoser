"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { X, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
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
/* Hook : centralise la logique URL / filtres                         */
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
/* Contenu des filtres (partagé sidebar + drawer mobile)              */
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
    <div className="space-y-8 text-white">
      {/* SECTION MARQUES */}
      <div>
        <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
          [ Filtrer par Marque ]
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => apply({ marque: null })}
              className={cn(
                "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-sans text-sm transition-all duration-300",
                !currentBrand
                  ? "border border-brand-red/30 bg-brand-red/10 font-medium text-white shadow-lg shadow-brand-red/10"
                  : "border border-white/5 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>Toutes les marques</span>
              {!currentBrand && <Check className="h-4 w-4 text-brand-red" />}
            </button>
          </li>
          {brands.map((b) => {
            const isActive = currentBrand === b.slug;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => apply({ marque: b.slug })}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-sans text-sm transition-all duration-300",
                    isActive
                      ? "border border-brand-red/30 bg-brand-red/10 font-medium text-white shadow-lg shadow-brand-red/10"
                      : "border border-white/5 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{b.name}</span>
                  {isActive && <Check className="h-4 w-4 text-brand-red" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SECTION PRIX */}
      <div>
        <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
          [ Fourchette de Prix (FCFA) ]
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05]"
          />
          <span className="text-neutral-600">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05]"
          />
        </div>
        <button
          type="button"
          onClick={() => apply({ min: minPrice || null, max: maxPrice || null })}
          className="mt-4 w-full rounded-full border border-white/15 bg-white/5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-brand-red hover:bg-brand-red"
        >
          Appliquer le prix
        </button>
      </div>

      {/* RÉINITIALISATION */}
      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-red-400 transition-all duration-300 hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
          <span>Réinitialiser les filtres</span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SIDEBAR (desktop / tablette)                                        */
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
    <aside className="sticky top-28 rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
        <h2 className="font-display text-xl font-light text-white">
          Filtres
        </h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-neutral-400">
          {totalCount} {totalCount > 1 ? "produits" : "produit"}
        </span>
      </div>
      <FilterContent brands={brands} filters={filters} />
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* TOOLBAR (au-dessus de la grille)                                   */
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
      {/* ---- BARRE MOBILE (< md) ---- */}
      <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-neutral-900/60 px-5 py-3 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-xl"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand-red" />
          <span>Filtres</span>
          {hasFilters && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white animate-pulse">
              !
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => apply({ tri: e.target.value })}
            className="appearance-none rounded-full border border-white/15 bg-neutral-900/60 px-5 py-3 pr-10 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-xl outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-neutral-950 text-white">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* ---- BARRE DESKTOP (md+) ---- */}
      <div className="mb-8 hidden items-center justify-between md:flex">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          <span className="font-bold text-white">{totalCount}</span> produit{totalCount > 1 ? "s" : ""} référencé{totalCount > 1 ? "s" : ""}
        </p>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => apply({ tri: e.target.value })}
            className="appearance-none rounded-full border border-white/15 bg-neutral-900/40 px-6 py-3.5 pr-12 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-xl outline-none transition-all duration-300 hover:border-white/30 focus:border-brand-red"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-neutral-950 text-white">
                Trier : {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* ---- DRAWER MOBILE (< md) ---- */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] border-t border-white/15 bg-neutral-950 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-4">
              <h2 className="font-display text-2xl font-light text-white">
                Filtres & Tri
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterContent brands={brands} filters={filters} />
          </div>
        </div>
      )}
    </>
  );
}