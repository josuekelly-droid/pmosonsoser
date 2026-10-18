"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  priceB2C: number;
  images: string[];
  brand: { name: string };
};

export function SearchModal({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void; // ⬅️ Renommé
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction(); // ⬅️ Renommé
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseAction]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onCloseAction(); // ⬅️ Renommé
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction} // ⬅️ Renommé
            className="fixed inset-0 z-[60] bg-brand-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-20 z-[70] w-[90%] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:top-32"
          >
            <form onSubmit={handleSubmit} className="flex items-center border-b border-brand-black/5 px-4">
              <Search className="h-5 w-5 shrink-0 text-brand-black/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une moto, une marque, une pièce…"
                className="h-16 flex-1 bg-transparent px-4 text-base text-brand-black outline-none placeholder:text-brand-black/40"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-brand-red" />}
              {!loading && query && (
                <button type="button" onClick={() => setQuery("")} className="p-2 text-brand-black/40 hover:text-brand-black">
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onCloseAction} // ⬅️ Renommé
                className="ml-2 rounded-lg bg-brand-gray px-2 py-1 text-[10px] font-semibold text-brand-black/50 hover:bg-brand-black/10"
              >
                ESC
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.length > 0 && query.length < 2 && (
                <p className="p-8 text-center text-sm text-brand-black/50">
                  Tapez au moins 2 caractères pour lancer la recherche.
                </p>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-brand-black">Aucun résultat pour "{query}"</p>
                  <p className="mt-1 text-xs text-brand-black/50">Essayez un autre mot-clé.</p>
                </div>
              )}

              {results.length > 0 && (
                <div>
                  <p className="px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-brand-black/40">
                    Produits ({results.length})
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produits/${product.id}`}
                      onClick={onCloseAction} // ⬅️ Renommé
                      className="group flex items-center gap-4 rounded-xl p-3 transition hover:bg-brand-gray"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-gray">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-black text-[8px] text-white">
                            {product.brand.name.slice(0, 3)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-black group-hover:text-brand-red">
                          {product.name}
                        </p>
                        <p className="text-xs text-brand-black/50">{product.brand.name}</p>
                      </div>
                      <p className="shrink-0 font-display text-sm text-brand-black">
                        {formatPrice(product.priceB2C)}
                      </p>
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleSubmit}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red/5 p-3 text-xs font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
                  >
                    Voir tous les résultats pour "{query}"
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}