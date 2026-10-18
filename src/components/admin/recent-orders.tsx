import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  EXPEDIE: "Expédié",
  LIVRE: "Livré",
  ANNULE: "Annulé",
};

const STATUS_STYLES: Record<string, string> = {
  EN_ATTENTE: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  PAYE: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  EXPEDIE: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  LIVRE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  ANNULE: "border-red-500/30 bg-red-500/10 text-red-400",
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
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/40 py-16 px-4 text-center backdrop-blur-2xl">
        <ShoppingCart className="h-10 w-10 text-neutral-600" />
        <p className="mt-3 font-mono text-xs text-neutral-400">Aucune commande récente pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-black/40">
              <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Commande
              </th>
              <th className="hidden px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 md:table-cell">
                Client
              </th>
              <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Statut
              </th>
              <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr
                key={o.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/commandes/${o.id}`}
                    className="font-mono text-sm font-bold text-white transition-colors hover:text-brand-red"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </td>
                <td className="hidden px-6 py-4 md:table-cell">
                  <p className="font-sans text-sm font-medium text-white">{o.customerName}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-xl border px-3 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md",
                      STATUS_STYLES[o.statut] || "border-white/10 bg-white/5 text-neutral-300"
                    )}
                  >
                    {STATUS_LABELS[o.statut] || o.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-display text-lg font-light tracking-wide text-white">
                  {formatPrice(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}