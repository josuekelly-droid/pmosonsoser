"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Connexion impossible au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Supprimer le produit"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <span className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-red-400">
              [ Action critique ]
            </span>
            <h3 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
              Supprimer ce produit ?
            </h3>
            
            <p className="mt-3 font-mono text-xs md:text-sm leading-relaxed text-neutral-300">
              «&nbsp;<strong className="text-white">{productName}</strong>&nbsp;» sera définitivement effacé du catalogue. Cette opération est irréversible.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 bg-white/5 py-3.5 font-mono text-xs uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-600 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-red-600/30 transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Suppression…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}