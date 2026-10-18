import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  href?: string;
};

export function StatCard({ label, value, icon: Icon, trend, href }: Props) {
  const inner = (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-neutral-900/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] md:p-8">
      {/* Halo lumineux subtil au survol */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-red/0 blur-[50px] transition-all duration-500 group-hover:bg-brand-red/20 pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        {/* Conteneur d'icône HUD */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md transition-all duration-300 group-hover:bg-brand-red group-hover:text-white group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]">
          <Icon className="h-6 w-6" />
        </div>

        {/* Badge Tendance HUD */}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md",
              trend.positive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}