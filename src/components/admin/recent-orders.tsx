import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  EXPEDIE: "Expédié",
  LIVRE: "Livré",
  ANNULE: "Annulé",
};

const STATUS_STYLES: Record<string, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-700",
  PAYE: "bg-blue-100 text-blue-700",
  EXPEDIE: "bg-purple-100 text-purple-700",
  LIVRE: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  statut: string;
  createdAt: Date;
};

export function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-black/10 bg-white py-12 text-center">
        <p className="text-sm text-brand-black/50">Aucune commande pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-black/5 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-black/5 bg-brand-gray/40">
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
              Commande
            </th>
            <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50 md:table-cell">
              Client
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-brand-black/5 last:border-0 transition hover:bg-brand-gray/30"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/commandes/${o.id}`}
                  className="text-sm font-semibold text-brand-black transition hover:text-brand-red"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-[11px] text-brand-black/50">
                  {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <p className="text-sm text-brand-black">{o.customerName}</p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                    STATUS_STYLES[o.statut] || "bg-gray-100 text-gray-700"
                  )}
                >
                  {STATUS_LABELS[o.statut] || o.statut}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-display text-base tracking-wide text-brand-black">
                {formatPrice(o.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}