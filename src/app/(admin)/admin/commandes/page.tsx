import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/orders-table";

export const metadata: Metadata = {
  title: "Commandes | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      telephone: true,
      total: true,
      statut: true,
      methodePaiement: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Suivi des flux & Ventes ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Commandes
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Supervisez le traitement des commandes, validez les paiements manuels et gérez l'avancement de l'expédition.
        </p>
      </div>

      {/* TABLEAU COMPLET ET FILTRES GLASSMORPHISM */}
      <OrdersTable initialOrders={orders} />
    </div>
  );
}