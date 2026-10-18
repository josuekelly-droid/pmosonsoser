import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Clock,
  Send,
  Building2,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { OrderStatusChanger } from "@/components/admin/order-status-changer";
import { OrderPaymentPanel } from "@/components/admin/order-payment-panel";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type OrderStatus,
} from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Détail commande | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, { label: string; icon: any }> = {
  FEDAPAY: { label: "Mobile Money (FedaPay)", icon: CreditCard },
  WESTERN_UNION: { label: "Western Union", icon: Send },
  VIREMENT: { label: "Virement bancaire", icon: Building2 },
};

export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { brand: true, category: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = order.total - subtotal;
  const payment = PAYMENT_LABELS[order.methodePaiement] || {
    label: order.methodePaiement,
    icon: CreditCard,
  };
  const PaymentIcon = payment.icon;

  return (
    <div className="space-y-6">
      {/* Retour + header */}
      <div>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-black/60 transition hover:text-brand-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
                {order.orderNumber}
              </h1>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  STATUS_STYLES[order.statut as OrderStatus]
                )}
              >
                {STATUS_LABELS[order.statut as OrderStatus]}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-black/50">
              <Clock className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Articles */}
          <section className="rounded-2xl border border-brand-black/5 bg-white p-6">
            <h2 className="font-display text-xl tracking-wide text-brand-black">
              Articles commandés
            </h2>
            <ul className="mt-4 divide-y divide-brand-black/5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-gray">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-black to-brand-red/30">
                        <span className="font-display text-xs text-white/60">
                          {item.product.brand.name.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produits/${item.productId}`}
                      target="_blank"
                      className="line-clamp-1 text-sm font-medium text-brand-black transition hover:text-brand-red"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-brand-black/50">
                      {item.product.brand.name} · x{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-base text-brand-black">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totaux */}
            <dl className="mt-4 space-y-2 border-t border-brand-black/5 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-black/60">Sous-total</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-black/60">
                  Livraison
                  {order.deliveryDistance != null && (
                    <span className="ml-1 text-xs text-brand-black/40">
                      ({order.deliveryDistance.toFixed(1)} km)
                    </span>
                  )}
                </dt>
                <dd className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-green-700">Offerte</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-brand-black/5 pt-3">
                <dt className="font-display text-base tracking-wide text-brand-black">
                  Total
                </dt>
                <dd className="font-display text-2xl text-brand-red">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Client & livraison */}
          <section className="rounded-2xl border border-brand-black/5 bg-white p-6">
            <h2 className="font-display text-xl tracking-wide text-brand-black">
              Client & livraison
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-brand-black">
                  <UserIcon className="h-4 w-4 shrink-0 text-brand-red" />
                  <span className="font-medium">{order.customerName}</span>
                </p>
                <p className="flex items-center gap-2 text-brand-black/70">
                  <Mail className="h-4 w-4 shrink-0 text-brand-red" />
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="hover:underline"
                  >
                    {order.customerEmail}
                  </a>
                </p>
                <p className="flex items-center gap-2 text-brand-black/70">
                  <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                  <a
                    href={`tel:${order.telephone}`}
                    className="hover:underline"
                  >
                    {order.telephone}
                  </a>
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2 text-brand-black/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  <span>{order.adresseLivraison}</span>
                </p>
                {order.deliveryLat != null && order.deliveryLng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-red hover:underline"
                  >
                    Ouvrir dans Google Maps →
                  </a>
                )}
                {order.notes && (
                  <p className="rounded-xl bg-brand-gray/60 p-3 text-xs italic text-brand-black/60">
                    « {order.notes} »
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Panel paiement (WU / virement) */}
          {order.statut === "EN_ATTENTE" && order.methodePaiement !== "FEDAPAY" && (
            <OrderPaymentPanel
              orderId={order.id}
              methodePaiement={order.methodePaiement}
              currentCodeMTCN={order.codeMTCN}
              currentPreuve={order.preuvePaiement}
            />
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6">
          {/* Paiement */}
          <div className="rounded-2xl border border-brand-black/5 bg-white p-6">
            <h3 className="font-display text-lg tracking-wide text-brand-black">
              Paiement
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gray text-brand-black">
                <PaymentIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-brand-black">
                {payment.label}
              </p>
            </div>

            {order.codeMTCN && (
              <div className="mt-4 rounded-xl bg-brand-gray/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Code MTCN
                </p>
                <p className="mt-1 font-mono text-sm text-brand-black">
                  {order.codeMTCN}
                </p>
              </div>
            )}

            {order.preuvePaiement && (
              <a
                href={order.preuvePaiement}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gray/60 p-3 text-xs font-medium text-brand-red transition hover:bg-brand-gray"
              >
                Voir la preuve de paiement →
              </a>
            )}
          </div>

          {/* Actions statut */}
          <OrderStatusChanger
            orderId={order.id}
            currentStatus={order.statut as OrderStatus}
          />
        </aside>
      </div>
    </div>
  );
}