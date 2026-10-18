"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Send, Building2, ExternalLink } from "lucide-react";

export function OrderPaymentPanel({
  orderId,
  methodePaiement,
  currentCodeMTCN,
  currentPreuve,
}: {
  orderId: string;
  methodePaiement: string;
  currentCodeMTCN: string | null;
  currentPreuve: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeMTCN, setCodeMTCN] = useState(currentCodeMTCN || "");
  const [preuve, setPreuve] = useState(currentPreuve || "");

  if (methodePaiement === "FEDAPAY") return null;

  const isWU = methodePaiement === "WESTERN_UNION";

  async function validatePayment() {
    if (isWU && !codeMTCN) {
      setError("Le code MTCN est requis.");
      return;
    }
    if (!isWU && !preuve) {
      setError("L'URL de la preuve de virement est requise.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut: "PAYE",
          codeMTCN: isWU ? codeMTCN : "",
          preuvePaiement: !isWU ? preuve : "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la validation");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible au serveur");
    } finally {
      setLoading(false);
    }
  }

  async function saveOnly() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut: "EN_ATTENTE",
          codeMTCN: isWU ? codeMTCN : "",
          preuvePaiement: !isWU ? preuve : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'enregistrement");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
      {/* Halo lumineux subtil */}
      <div className="absolute right-0 top-0 h-[250px] w-[250px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {isWU ? <Send className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400">
            [ Gestion financière ]
          </span>
          <h3 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
            Valider le paiement {isWU ? "Western Union" : "par virement"}
          </h3>
          <p className="mt-1 font-mono text-xs text-neutral-400 leading-relaxed">
            Vérifiez le justificatif ou le code reçu, puis confirmez pour basculer la commande au statut «&nbsp;Payé&nbsp;».
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {isWU ? (
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-300">
              Code MTCN *
            </label>
            <input
              type="text"
              value={codeMTCN}
              onChange={(e) => setCodeMTCN(e.target.value)}
              placeholder="Ex: 1234567890"
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-5 font-mono text-sm text-white placeholder-neutral-600 outline-none backdrop-blur-md transition-colors focus:border-brand-red"
            />
          </div>
        ) : (
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-300">
              URL de la preuve (capture / PDF) *
            </label>
            <input
              type="url"
              value={preuve}
              onChange={(e) => setPreuve(e.target.value)}
              placeholder="https://…"
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-5 font-mono text-sm text-white placeholder-neutral-600 outline-none backdrop-blur-md transition-colors focus:border-brand-red"
            />
            {preuve && (
              <a
                href={preuve}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-xs text-brand-red hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Consulter la preuve de virement</span>
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4 pt-2 border-t border-white/10">
          <button
            onClick={validatePayment}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600 px-7 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Confirmer le paiement</span>
          </button>
          
          <button
            onClick={saveOnly}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-50"
          >
            <span>Enregistrer sans valider</span>
          </button>
        </div>
      </div>
    </div>
  );
}