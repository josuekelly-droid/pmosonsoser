import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { SalesChart } from "@/components/admin/sales-chart";

export const metadata: Metadata = {
  title: "Tableau de bord | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    revenueAgg,
    pendingOrdersCount,
    lowStockProducts,
    recentOrders,
    validOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] } },
      _sum: { total: true },
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

  const revenue = revenueAgg._sum.total || 0;

  // Préparer les données du graphique
  const chartDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("fr-FR", { weekday: "short" });
    chartDataMap.set(dayStr, 0);
  }
  validOrders.forEach((order) => {
    const dayStr = order.createdAt.toLocaleDateString("fr-FR", { weekday: "short" });
    if (chartDataMap.has(dayStr)) {
      chartDataMap.set(dayStr, chartDataMap.get(dayStr) + order.total);
    }
  });
  const chartData = Array.from(chartDataMap.entries()).map(([name, total]) => ({
    name,
    total,
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Vue d'ensemble
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Résumé de l'activité PM Osons Oser.
        </p>
      </div>

      {/* Alerte stock */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">Alerte stock faible</p>
            <p className="mt-1 text-xs text-amber-800/80">
              {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(" · ")}
            </p>
          </div>
          <Link href="/admin/produits?stock=low" className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 md:inline-flex">
            Voir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardLight label="Chiffre d'affaires" value={formatPrice(revenue)} icon={TrendingUp} trend="+12.5% ce mois" />
        <StatCardLight label="Commandes" value={totalOrders} icon={ShoppingCart} badge={pendingOrdersCount > 0 ? `${pendingOrdersCount} en attente` : undefined} />
        <StatCardLight label="Produits" value={totalProducts} icon={Package} />
        <StatCardLight label="Clients" value={totalUsers} icon={Users} />
      </div>

      {/* Graphique + Dernières commandes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Graphique */}
        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl tracking-wide text-brand-black">Ventes des 7 derniers jours</h2>
              <p className="mt-1 text-xs text-brand-black/50">Évolution du chiffre d'affaires</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <SalesChart data={chartData} />
        </div>

        {/* Dernières commandes */}
        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-brand-black">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-xs font-semibold text-brand-red transition hover:text-brand-black">Tout voir</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/commandes/${o.id}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-black/5 bg-brand-gray/30 p-3 transition hover:border-brand-red/20 hover:bg-brand-red/5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-black group-hover:text-brand-red">{o.customerName}</p>
                  <p className="text-[11px] text-brand-black/50">{o.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-brand-black">{formatPrice(o.total)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-red">{o.statut.replace("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardLight({ label, value, icon: Icon, trend, badge }: { label: string, value: string | number, icon: any, trend?: string, badge?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-brand-black/5 bg-white p-5 shadow-sm transition hover:border-brand-red/20 hover:shadow-md md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gray text-brand-black/60 transition group-hover:bg-brand-red group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">{trend}</span>}
        {badge && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">{badge}</span>}
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-brand-black/50">{label}</p>
        <p className="mt-1 font-display text-3xl tracking-wide text-brand-black">{value}</p>
      </div>
    </div>
  );
}