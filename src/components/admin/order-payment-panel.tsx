"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Send, Building2 } from "lucide-react";

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
        setError(data.error || "Erreur");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible");
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
        setError(data.error || "Erreur");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
          {isWU ? <Send className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-display text-lg tracking-wide text-brand-black">
            Valider le paiement {isWU ? "Western Union" : "par virement"}
          </h3>
          <p className="mt-1 text-xs text-brand-black/60">
            Vérifiez le paiement reçu, puis confirmez pour passer la commande en
            «&nbsp;Payé&nbsp;».
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {isWU ? (
          <div>
            <label className="mb-2 block text-xs font-medium text-brand-black">
              Code MTCN *
            </label>
            <input
              type="text"
              value={codeMTCN}
              onChange={(e) => setCodeMTCN(e.target.value)}
              placeholder="Ex: 1234567890"
              className="h-11 w-full rounded-xl border border-brand-black/10 bg-white px-4 text-sm outline-none focus:border-brand-red"
            />
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-xs font-medium text-brand-black">
              URL de la preuve (capture / PDF) *
            </label>
            <input
              type="url"
              value={preuve}
              onChange={(e) => setPreuve(e.target.value)}
              placeholder="https://…"
              className="h-11 w-full rounded-xl border border-brand-black/10 bg-white px-4 text-sm outline-none focus:border-brand-red"
            />
            {preuve && (
              <a
                href={preuve}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-red hover:underline"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Voir la preuve
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={validatePayment}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-green-600 px-6 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirmer le paiement
          </button>
          <button
            onClick={saveOnly}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full border border-brand-black/10 bg-white px-6 text-sm font-medium text-brand-black transition hover:bg-brand-gray disabled:opacity-50"
          >
            Enregistrer sans valider
          </button>
        </div>
      </div>
    </div>
  );
}