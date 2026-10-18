import { Clock, CreditCard, Truck, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type OrderStatus } from "@/lib/order-status";

const STEPS = [
  { key: "EN_ATTENTE", label: "En attente", icon: Clock },
  { key: "PAYE", label: "Payé", icon: CreditCard },
  { key: "EXPEDIE", label: "Expédié", icon: Truck },
  { key: "LIVRE", label: "Livré", icon: CheckCircle2 },
] as const;

const STATUS_ORDER: Record<string, number> = {
  EN_ATTENTE: 0,
  PAYE: 1,
  EXPEDIE: 2,
  LIVRE: 3,
  ANNULE: -1,
};

export function OrderTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  // Cas spécial : commande annulée
  if (currentStatus === "ANNULE") {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/20 text-red-400">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
              [ Statut Commande ]
            </span>
            <p className="font-display text-lg font-light text-white">Commande Annulée</p>
            <p className="font-mono text-xs text-neutral-400">
              Cette commande a été annulée. Contactez notre support client pour toute assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER[currentStatus] ?? 0;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
      {/* Entête */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red">
            [ Suivi Temps Réel ]
          </span>
          <h3 className="mt-1 font-display text-2xl font-light text-white">
            État d'avancement
          </h3>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-neutral-300 md:flex">
          <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
          <span>{STEPS[currentIndex]?.label || "En cours"}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mt-10 px-2 pb-2">
        {/* Ligne de fond */}
        <div className="absolute left-6 right-6 top-5 z-0 h-0.5 bg-white/10" />

        {/* Ligne de progression néon */}
        <div
          className="absolute left-6 top-5 z-0 h-0.5 bg-brand-red shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all duration-700 ease-out"
          style={{
            width: `calc(${(currentIndex / (STEPS.length - 1)) * 100}% - ${
              currentIndex === 0 ? "0px" : "12px"
            })`,
          }}
        />

        {/* Étapes */}
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-500",
                    isActive
                      ? "border-brand-red bg-brand-red text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                      : "border-white/10 bg-neutral-950 text-neutral-600",
                    isCurrent && "ring-4 ring-brand-red/30 scale-110"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 text-center",
                    isActive ? "text-white" : "text-neutral-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}