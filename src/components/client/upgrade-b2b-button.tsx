"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store, ArrowUpRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UpgradeB2BButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/client/upgrade-b2b", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la demande.");
        setShowConfirm(false);
        return;
      }

      setShowConfirm(false);
      // Rafraîchit la page pour appliquer les nouveaux accès Pro
      router.refresh();
    } catch {
      setError("Connexion au serveur impossible.");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* BOUTON PRINCIPAL */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-red px-8 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:opacity-50"
      >
        <Store className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
        <span>Envoyer ma demande Pro</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
      </button>

      {/* FEEDBACK ERREUR */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DARK LUXURY */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowConfirm(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border border-white/15 bg-neutral-950/90 p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red">
                <Store className="h-7 w-7" />
              </div>

              <span className="mt-4 block font-mono text-xs uppercase tracking-[0.2em] text-brand-red">
                [ Accès B2B Grossiste ]
              </span>

              <h3 className="mt-2 font-display text-2xl font-light text-white">
                Passer en Compte Pro ?
              </h3>

              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                Vous soumettez une demande pour débloquer les tarifs préférentiels grossistes et revendeurs sur l'ensemble du catalogue.
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 py-3.5 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-red py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-red/25 transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                  ) : (
                    <>
                      <span>Confirmer</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}