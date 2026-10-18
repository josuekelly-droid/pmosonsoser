"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowUpRight, Sparkles } from "lucide-react";
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
  onCloseAction: () => void;
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
      if (e.key === "Escape") onCloseAction();
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
      onCloseAction();
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop sombre flouté */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-20 z-[70] w-[92%] max-w-2xl -translate-x-1/2 overflow-hidden rounded-[2.5rem] border border-white/15 bg-neutral-950/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:top-32"
          >
            {/* Header du formulaire */}
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center border-b border-white/10 px-6 py-2"
            >
              <Search className="h-5 w-5 shrink-0 text-brand-red" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une moto, une pièce, une huile..."
                className="h-16 flex-1 bg-transparent px-4 font-sans text-sm text-white placeholder:text-neutral-500 outline-none"
              />
              
              {loading && <Loader2 className="h-5 w-5 animate-spin text-brand-red" />}
              
              {!loading && query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              
              <button
                type="button"
                onClick={onCloseAction}
                className="ml-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                ESC
              </button>
            </form>

            {/* Corps des résultats */}
            <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-none">
              {query.length > 0 && query.length < 2 && (
                <p className="p-8 text-center font-mono text-xs text-neutral-500">
                  Saisissez au moins 2 caractères pour démarrer la recherche.
                </p>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-10 text-center">
                  <p className="font-display text-lg font-light text-white">
                    Aucun résultat trouvé pour <span className="italic font-serif font-normal text-neutral-400">"{query}"</span>
                  </p>
                  <p className="mt-2 font-mono text-xs text-neutral-500">
                    Vérifiez l'orthographe ou essayez d'autres mots-clés.
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red">
                    [ Résultats Trouvés : {results.length} ]
                  </p>

                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produits/${product.id}`}
                      onClick={onCloseAction}
                      className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.02] p-3 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-display text-xs text-neutral-500">
                            {product.brand.name.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-light text-white transition-colors duration-300 group-hover:text-brand-red">
                          {product.name}
                        </p>
                        <p className="font-mono text-xs text-neutral-500">{product.brand.name}</p>
                      </div>

                      <p className="shrink-0 font-display text-base font-light text-white">
                        {formatPrice(product.priceB2C)}
                      </p>
                    </Link>
                  ))}

                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="group/all mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-brand-red/30 bg-brand-red/10 p-4 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-all duration-300 hover:bg-brand-red hover:text-white"
                  >
                    <span>Voir tous les résultats pour "{query}"</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/all:rotate-45" />
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