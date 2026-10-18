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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">Commande annulée</p>
            <p className="text-xs text-red-700/80">
              Cette commande a été annulée. Contactez-nous si vous avez des questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER[currentStatus] ?? 0;

  return (
    <div className="rounded-2xl border border-brand-black/5 bg-white p-6">
      <h3 className="font-display text-lg tracking-wide text-brand-black">
        Suivi de la commande
      </h3>

      <div className="relative mt-8 flex justify-between">
        {/* Ligne de fond grise */}
        <div className="absolute left-5 right-5 top-5 -z-0 h-0.5 bg-brand-gray" />
        
        {/* Ligne de progression rouge */}
        <div 
          className="absolute left-5 top-5 -z-0 h-0.5 bg-brand-red transition-all duration-500"
          style={{ 
            width: `calc(${(currentIndex / (STEPS.length - 1)) * 100}% - ${currentIndex === 0 ? '0px' : '10px'})` 
          }}
        />

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isActive
                    ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30"
                    : "border-brand-gray bg-white text-brand-black/30",
                  isCurrent && "ring-4 ring-brand-red/20"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  isActive ? "text-brand-red" : "text-brand-black/40"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}