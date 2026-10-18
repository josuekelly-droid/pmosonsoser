"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";

export function OrderStatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

  async function changeTo(newStatus: OrderStatus) {
    if (
      newStatus === "ANNULE" &&
      !confirm(
        "Confirmer l'annulation de cette commande ? Le stock sera remis à jour."
      )
    ) {
      return;
    }

    setLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
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
      setLoading(null);
    }
  }

  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-black/5 bg-white p-6">
        <p className="text-sm text-brand-black/60">
          Cette commande est <strong>{STATUS_LABELS[currentStatus].toLowerCase()}</strong>.
          Aucune action disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-black/5 bg-white p-6">
      <h3 className="font-display text-lg tracking-wide text-brand-black">
        Faire avancer la commande
      </h3>
      <p className="mt-1 text-xs text-brand-black/50">
        Statut actuel : <strong>{STATUS_LABELS[currentStatus]}</strong>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {nextStatuses.map((s) => {
          const isLoading = loading === s;
          const isCancel = s === "ANNULE";
          return (
            <button
              key={s}
              onClick={() => changeTo(s)}
              disabled={loading !== null}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:opacity-50",
                isCancel
                  ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "bg-brand-red text-white shadow-lg shadow-brand-red/30 hover:bg-brand-red/90"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Marquer : {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}