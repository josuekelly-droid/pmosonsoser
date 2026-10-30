import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { SalesChart } from "@/components/admin/sales-chart";
import { MonthlyRevenueChart } from "@/components/admin/monthly-revenue-chart";

export const metadata: Metadata = {
  title: "Tableau de bord | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* ========================================================
   Helpers
   ======================================================== */
const MONTH_NAMES_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

export default async function AdminDashboardPage() {
  const currentMonth = getMonthRange(0);
  const previousMonth = getMonthRange(-1);

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    currentMonthStats,
    previousMonthStats,
    pendingOrdersCount,
    lowStockProducts,
    recentOrders,
    validOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    // CA du mois en cours
    prisma.order.aggregate({
      where: {
        statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] },
        createdAt: { gte: currentMonth.start, lt: currentMonth.end },
      },
      _sum: { total: true },
      _count: true,
    }),
    // CA du mois précédent
    prisma.order.aggregate({
      where: {
        statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] },
        createdAt: { gte: previousMonth.start, lt: previousMonth.end },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 3,
      include: { brand: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        statut: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  // CA du mois en cours et précédent
  const currentRevenue = currentMonthStats._sum.total || 0;
  const previousRevenue = previousMonthStats._sum.total || 0;
  const currentOrderCount = currentMonthStats._count;
  const previousOrderCount = previousMonthStats._count;

  // Calcul du % d'évolution
  const revenueChange =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0
      ? 100
      : 0;

  const orderChange =
    previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : currentOrderCount > 0
      ? 100
      : 0;

  // Historique des 6 derniers mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentPaidOrders = await prisma.order.findMany({
    where: {
      statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { total: true, createdAt: true },
  });

  const monthlyMap = new Map<
    string,
    { revenue: number; orders: number; label: string }
  >();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, {
      revenue: 0,
      orders: 0,
      label: MONTH_NAMES_FR[d.getMonth()],
    });
  }

  recentPaidOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.revenue += o.total;
      existing.orders += 1;
    }
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: data.label,
      revenue: data.revenue,
      orders: data.orders,
    }));

  // Ventes des 7 derniers jours
  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("fr-FR", { weekday: "short" });
    chartDataMap.set(dayStr, 0);
  }
  validOrders.forEach((order) => {
    const dayStr = order.createdAt.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
    if (chartDataMap.has(dayStr)) {
      chartDataMap.set(dayStr, chartDataMap.get(dayStr) + order.total);
    }
  });
  const chartData = Array.from(chartDataMap.entries()).map(([name, total]) => ({
    name,
    total,
  }));

  const currentMonthLabel = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Console de pilotage ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Vue d'ensemble
        </h1>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{currentMonthLabel}</span>
        </p>
      </div>

      {/* ALERTE STOCK */}
      {lowStockProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-5 text-amber-400 backdrop-blur-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
              Alerte stock critique
            </p>
            <p className="mt-1 font-mono text-xs text-amber-300/80 truncate">
              {lowStockProducts
                .map((p) => `${p.name} (${p.stock} restant${p.stock > 1 ? "s" : ""})`)
                .join(" · ")}
            </p>
          </div>
          <Link
            href="/admin/produits?stock=low"
            className="w-full sm:w-auto inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-300 transition-all hover:bg-amber-500 hover:text-black"
          >
            <span>Gérer le stock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* CARTES STATISTIQUES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardDark
          label="CA ce mois"
          value={formatPrice(currentRevenue)}
          icon={TrendingUp}
          trend={
            revenueChange !== 0
              ? {
                  value: `${revenueChange > 0 ? "+" : ""}${revenueChange.toFixed(1)}%`,
                  positive: revenueChange > 0,
                }
              : undefined
          }
        />
        <StatCardDark
          label="Commandes ce mois"
          value={currentOrderCount}
          icon={ShoppingCart}
          trend={
            orderChange !== 0
              ? {
                  value: `${orderChange > 0 ? "+" : ""}${orderChange.toFixed(1)}%`,
                  positive: orderChange > 0,
                }
              : undefined
          }
          badge={
            pendingOrdersCount > 0 ? `${pendingOrdersCount} en attente` : undefined
          }
        />
        <StatCardDark label="Produits" value={totalProducts} icon={Package} />
        <StatCardDark label="Clients" value={totalUsers} icon={Users} />
      </div>

      {/* CHIFFRE D'AFFAIRES MENSUEL (6 MOIS) */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-5 sm:p-8 backdrop-blur-2xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
              [ Analyse financière ]
            </span>
            <h2 className="mt-0.5 font-display text-2xl font-light tracking-wide text-white">
              Évolution du chiffre d'affaires
            </h2>
            <p className="mt-1 font-mono text-xs text-neutral-400">
              Comparatif sur les 6 derniers mois
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-2 text-[11px] font-semibold text-brand-red md:flex shrink-0">
            <TrendingUp className="h-3.5 w-3.5" />
            {formatPrice(currentRevenue)} ce mois
          </div>
        </div>

        <MonthlyRevenueChart data={monthlyData} />

        {/* Tableau récapitulatif responsive avec défilement horizontal */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                <th className="px-4 py-3 text-left">Mois</th>
                <th className="px-4 py-3 text-right">Commandes</th>
                <th className="px-4 py-3 text-right">CA</th>
                <th className="px-4 py-3 text-right">Panier moyen</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => {
                const isCurrent = i === monthlyData.length - 1;
                const avgOrder = m.orders > 0 ? m.revenue / m.orders : 0;
                return (
                  <tr
                    key={m.month}
                    className={`border-b border-white/5 last:border-0 ${
                      isCurrent ? "bg-brand-red/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium text-white whitespace-nowrap">
                      {m.label}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-brand-red/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-red">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-neutral-300">
                      {m.orders}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-display text-base whitespace-nowrap ${
                        isCurrent ? "text-brand-red" : "text-white"
                      }`}
                    >
                      {formatPrice(m.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-neutral-400 whitespace-nowrap">
                      {avgOrder > 0 ? formatPrice(avgOrder) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAPHIQUE 7J + DERNIÈRES COMMANDES */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-5 sm:p-8 backdrop-blur-2xl lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
                [ Performance hebdomadaire ]
              </span>
              <h2 className="mt-0.5 font-display text-2xl font-light tracking-wide text-white">
                Ventes des 7 derniers jours
              </h2>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <SalesChart data={chartData} />
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-5 sm:p-8 backdrop-blur-2xl">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
                  [ Flux en direct ]
                </span>
                <h2 className="mt-0.5 font-display text-2xl font-light tracking-wide text-white">
                  Dernières commandes
                </h2>
              </div>
              <Link
                href="/admin/commandes"
                className="font-mono text-xs uppercase tracking-widest text-brand-red transition-colors hover:text-white shrink-0"
              >
                Tout voir
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/commandes/${o.id}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-brand-red/40 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium text-white group-hover:text-brand-red transition-colors">
                      {o.customerName}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-neutral-400 truncate">
                      {o.orderNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-base font-light text-white whitespace-nowrap">
                      {formatPrice(o.total)}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand-red">
                      {o.statut.replace("_", " ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   Composant StatCardDark (Responsive)
   ======================================================== */
function StatCardDark({
  label,
  value,
  icon: Icon,
  trend,
  badge,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  badge?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-neutral-900/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] md:p-8">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md transition-all duration-300 group-hover:bg-brand-red group-hover:text-white group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md ${
                trend.positive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="h-3 w-3 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 shrink-0" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
          {badge && (
            <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 backdrop-blur-md">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 truncate">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl sm:text-3xl font-light tracking-wide text-white md:text-4xl truncate">
          {value}
        </p>
      </div>
    </div>
  );
}