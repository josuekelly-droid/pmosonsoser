"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpRight, AlertCircle, RefreshCw } from "lucide-react";
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
        "Confirmer l'annulation de cette commande ? Le stock sera automatiquement remis à jour."
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
        setError(data.error || "Erreur lors du changement de statut");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible au serveur");
    } finally {
      setLoading(null);
    }
  }

  if (nextStatuses.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
        <p className="font-mono text-xs md:text-sm text-neutral-400 leading-relaxed">
          Cette commande est actuellement <strong className="text-white">{STATUS_LABELS[currentStatus].toLowerCase()}</strong>. Aucune transition de statut ultérieure n'est disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
        [ Workflow logistique ]
      </span>
      <h3 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
        Faire avancer la commande
      </h3>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Statut actuel : <strong className="text-white">{STATUS_LABELS[currentStatus]}</strong>
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {nextStatuses.map((s) => {
          const isLoading = loading === s;
          const isCancel = s === "ANNULE";
          return (
            <button
              key={s}
              onClick={() => changeTo(s)}
              disabled={loading !== null}
              className={cn(
                "group inline-flex h-12 items-center gap-2.5 rounded-full px-7 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50",
                isCancel
                  ? "border border-red-500/30 bg-red-500/10 text-red-400 backdrop-blur-md hover:bg-red-500/20"
                  : "border border-brand-red/30 bg-brand-red text-white shadow-xl shadow-brand-red/30 hover:bg-white hover:text-black"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              )}
              <span>Marquer : {STATUS_LABELS[s]}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}