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
      label: "En Stock",
      sublabel: `${stock} unités disponibles`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      bar: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
      barWidth: "100%",
    },
    low: {
      label: "Stock Limité",
      sublabel: `Plus que ${stock} unités en stock`,
      icon: Package,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      bar: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
      barWidth: `${Math.min(100, (stock / 15) * 100)}%`,
    },
    critical: {
      label: "Bientôt Épuisé",
      sublabel: `Dernières unités : seulement ${stock} disponible${stock > 1 ? "s" : ""}`,
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      bar: "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]",
      barWidth: `${Math.min(100, (stock / 15) * 100)}%`,
    },
    out: {
      label: "Rupture de Stock",
      sublabel: "Produit indisponible pour le moment",
      icon: XCircle,
      color: "text-red-400",
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
          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest backdrop-blur-md transition-all duration-300",
          config.bg,
          config.border,
          config.color
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.bar.split(" ")[0])} />
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-5 backdrop-blur-xl transition-all duration-500",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 shadow-inner",
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              {/* [ Disponibilité ] */}
            </span>
            <p className={cn("font-display text-base font-light leading-tight", config.color)}>
              {config.label}
            </p>
            <p className="font-mono text-xs text-neutral-400">{config.sublabel}</p>
          </div>
        </div>

        {stock > 0 && (
          <div className="text-right">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block">
              Quantité
            </span>
            <span className={cn("font-display text-3xl font-extralight tracking-tight", config.color)}>
              {stock < 10 ? `0${stock}` : stock}
            </span>
          </div>
        )}
      </div>

      {stock > 0 && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/50 p-0.5">
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", config.bar)}
            style={{ width: config.barWidth }}
          />
        </div>
      )}
    </div>
  );
}