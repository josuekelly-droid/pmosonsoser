import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
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

  // Préparer les données du graphique analytique
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
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Console de pilotage ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Vue d'ensemble
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Synthèse en temps réel des performances commerciales et de l'activité globale PM Osons Oser.
        </p>
      </div>

      {/* ALERTE STOCK FAIBLE */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-center gap-4 rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-5 text-amber-400 backdrop-blur-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">Alerte stock critique</p>
            <p className="mt-1 font-mono text-xs text-amber-300/80 truncate">
              {lowStockProducts.map((p) => `${p.name} (${p.stock} restant${p.stock > 1 ? "s" : ""})`).join(" · ")}
            </p>
          </div>
          <Link
            href="/admin/produits?stock=low"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-300 transition-all hover:bg-amber-500 hover:text-black md:inline-flex"
          >
            <span>Gérer le stock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* CARTES STATISTIQUES GLASSMORPHISM */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardDark
          label="Chiffre d'affaires"
          value={formatPrice(revenue)}
          icon={TrendingUp}
          trend="+12.5% ce mois"
        />
        <StatCardDark
          label="Commandes totales"
          value={totalOrders}
          icon={ShoppingCart}
          badge={pendingOrdersCount > 0 ? `${pendingOrdersCount} en attente` : undefined}
        />
        <StatCardDark
          label="Produits en catalogue"
          value={totalProducts}
          icon={Package}
        />
        <StatCardDark
          label="Clients enregistrés"
          value={totalUsers}
          icon={Users}
        />
      </div>

      {/* GRAPHIQUE + DERNIÈRES COMMANDES */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Graphique Ventes */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
                [ Performance hebdomadaire ]
              </span>
              <h2 className="mt-0.5 font-display text-2xl font-light tracking-wide text-white">
                Ventes des 7 derniers jours
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <SalesChart data={chartData} />
        </div>

        {/* Dernières Commandes */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
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
                className="font-mono text-xs uppercase tracking-widest text-brand-red transition-colors hover:text-white"
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
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-medium text-white group-hover:text-brand-red transition-colors">
                      {o.customerName}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                      {o.orderNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-base font-light text-white">
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
  trend?: string;
  badge?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-neutral-900/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] md:p-8">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md transition-all duration-300 group-hover:bg-brand-red group-hover:text-white group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]">
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400 backdrop-blur-md">
            {trend}
          </span>
        )}
        {badge && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 backdrop-blur-md">
            {badge}
          </span>
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
}