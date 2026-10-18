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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Commandes
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Suivez et faites avancer les commandes de vos clients.
        </p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}