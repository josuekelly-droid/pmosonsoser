import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-black/5 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-red/20 hover:shadow-lg md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
              trend.positive
                ? "bg-green-500/10 text-green-700"
                : "bg-red-500/10 text-red-700"
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-black/50">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}