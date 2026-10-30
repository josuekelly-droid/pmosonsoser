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

function getMonthLabel(date: Date) {
  return MONTH_NAMES_FR[date.getMonth()];
}

/* ========================================================
   Page
   ======================================================== */
export default async function AdminDashboardPage() {
  const currentMonth = getMonthRange(0);
  const previousMonth = getMonthRange(-1);

  // 1. Stats globales
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    currentMonthStats,
    previousMonthStats,
    pendingOrdersCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: {
        statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] },
        createdAt: { gte: currentMonth.start, lt: currentMonth.end },
      },
      _sum: { total: true },
      _count: true,
    }),
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
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        statut: true,
        createdAt: true,
      },
    }),
  ]);

  // 2. CA du mois en cours et du mois précédent
  const currentRevenue = currentMonthStats._sum.total || 0;
  const previousRevenue = previousMonthStats._sum.total || 0;
  const currentOrderCount = currentMonthStats._count;
  const previousOrderCount = previousMonthStats._count;

  // 3. Pourcentage d'évolution
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

  // 4. Historique des 6 derniers mois
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

  // Initialise les 6 derniers mois à 0
  const monthlyMap = new Map<string, { revenue: number; orders: number; label: string }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, {
      revenue: 0,
      orders: 0,
      label: getMonthLabel(d),
    });
  }

  // Agrège les commandes par mois
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

  // 5. Ventes des 7 derniers jours (garde la logique existante)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const validOrders7d = recentPaidOrders.filter(
    (o) => new Date(o.createdAt) >= sevenDaysAgo
  );

  const chartDataMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("fr-FR", { weekday: "short" });
    chartDataMap.set(dayStr, 0);
  }

  validOrders7d.forEach((order) => {
    const dayStr = new Date(order.createdAt).toLocaleDateString("fr-FR", {
      weekday: "short",
    });
    if (chartDataMap.has(dayStr)) {
      chartDataMap.set(dayStr, chartDataMap.get(dayStr)! + order.total);
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
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
            Vue d'ensemble
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-brand-black/60">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{currentMonthLabel}</span>
          </p>
        </div>
      </div>

      {/* Alerte stock */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Alerte stock faible
            </p>
            <p className="mt-1 text-xs text-amber-800/80">
              {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(" · ")}
            </p>
          </div>
          <Link
            href="/admin/produits?stock=low"
            className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 md:inline-flex"
          >
            Voir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardLight
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
        <StatCardLight
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
            pendingOrdersCount > 0
              ? `${pendingOrdersCount} en attente`
              : undefined
          }
        />
        <StatCardLight label="Produits" value={totalProducts} icon={Package} />
        <StatCardLight label="Clients" value={totalUsers} icon={Users} />
      </div>

      {/* CA Mensuel (6 mois) */}
      <div className="rounded-3xl border border-brand-black/5 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl tracking-wide text-brand-black">
              Évolution du chiffre d'affaires
            </h2>
            <p className="mt-1 text-xs text-brand-black/50">
              Comparatif sur les 6 derniers mois
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1.5 text-[11px] font-semibold text-brand-red md:flex">
            <TrendingUp className="h-3.5 w-3.5" />
            {formatPrice(currentRevenue)} ce mois
          </div>
        </div>

        <MonthlyRevenueChart data={monthlyData} />

        {/* Tableau récapitulatif mensuel */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-black/5">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-gray/40 text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                <th className="px-4 py-3 text-left">Mois</th>
                <th className="px-4 py-3 text-right">Commandes</th>
                <th className="px-4 py-3 text-right">Chiffre d'affaires</th>
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
                    className={`border-t border-brand-black/5 ${
                      isCurrent ? "bg-brand-red/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-brand-black">
                      {m.label}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-brand-red/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-red">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-black/70">
                      {m.orders}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-display text-base ${
                        isCurrent ? "text-brand-red" : "text-brand-black"
                      }`}
                    >
                      {formatPrice(m.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-black/60">
                      {avgOrder > 0 ? formatPrice(avgOrder) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventes 7 jours + Dernières commandes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl tracking-wide text-brand-black">
                Ventes des 7 derniers jours
              </h2>
              <p className="mt-1 text-xs text-brand-black/50">
                Activité récente
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <SalesChart data={chartData} />
        </div>

        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-brand-black">
              Dernières commandes
            </h2>
            <Link
              href="/admin/commandes"
              className="text-xs font-semibold text-brand-red transition hover:text-brand-black"
            >
              Tout voir
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/commandes/${o.id}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-black/5 bg-brand-gray/30 p-3 transition hover:border-brand-red/20 hover:bg-brand-red/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-black group-hover:text-brand-red">
                    {o.customerName}
                  </p>
                  <p className="text-[11px] text-brand-black/50">
                    {o.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-brand-black">
                    {formatPrice(o.total)}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-red">
                    {o.statut.replace("_", " ")}
                  </p>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-brand-black/40">
                Aucune commande récente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   Composant local StatCardLight (mise à jour)
   ======================================================== */
function StatCardLight({
  label,
  value,
  icon: Icon,
  trend,
  badge,
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: { value: string; positive: boolean };
  badge?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-brand-black/5 bg-white p-5 shadow-sm transition hover:border-brand-red/20 hover:shadow-md md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gray text-brand-black/60 transition group-hover:bg-brand-red group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              trend.positive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
        {badge && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-brand-black/50">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl tracking-wide text-brand-black">
          {value}
        </p>
      </div>
    </div>
  );
}