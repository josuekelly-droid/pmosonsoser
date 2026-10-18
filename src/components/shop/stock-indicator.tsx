import { Package, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  stock: number;
  variant?: "compact" | "full";
};

export function StockIndicator({ stock, variant = "full" }: Props) {
  const state =
    stock <= 0
      ? "out"
      : stock <= 5
      ? "critical"
      : stock <= 15
      ? "low"
      : "in";

  const config = {
    in: {
      label: "En stock",
      sublabel: `${stock} unités disponibles`,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      bar: "bg-green-500",
      barWidth: "100%",
    },
    low: {
      label: "Stock limité",
      sublabel: `Plus que ${stock} en stock`,
      icon: Package,
      color: "text-amber-700",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      bar: "bg-amber-500",
      barWidth: `${Math.min(100, (stock / 15) * 100)}%`,
    },
    critical: {
      label: "Bientôt épuisé",
      sublabel: `Seulement ${stock} en stock`,
      icon: AlertTriangle,
      color: "text-orange-700",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      bar: "bg-orange-500",
      barWidth: `${Math.min(100, (stock / 15) * 100)}%`,
    },
    out: {
      label: "Rupture de stock",
      sublabel: "Indisponible pour le moment",
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      bar: "bg-red-500",
      barWidth: "0%",
    },
  }[state];

  const Icon = config.icon;

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
          config.bg,
          config.border,
          config.color
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-white",
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", config.color)}>
              {config.label}
            </p>
            <p className="text-xs text-brand-black/60">{config.sublabel}</p>
          </div>
        </div>
        {stock > 0 && (
          <span className={cn("font-display text-2xl tracking-wide", config.color)}>
            {stock}
          </span>
        )}
      </div>

      {stock > 0 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div
            className={cn("h-full rounded-full transition-all", config.bar)}
            style={{ width: config.barWidth }}
          />
        </div>
      )}
    </div>
  );
}