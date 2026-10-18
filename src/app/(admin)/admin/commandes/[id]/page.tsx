import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Clock,
  Send,
  Building2,
  CreditCard,
  ExternalLink,
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
    <div className="space-y-8">
      {/* Retour + Header */}
      <div>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4 rotate-[225deg]" />
          <span>Retour à la liste des commandes</span>
        </Link>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
                [ Référence commande ]
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4">
              <h1 className="font-display text-3xl font-light tracking-wide text-white md:text-5xl">
                {order.orderNumber}
              </h1>
              <span
                className={cn(
                  "inline-flex rounded-xl border px-3.5 py-1 font-mono text-xs uppercase tracking-wider backdrop-blur-md",
                  STATUS_STYLES[order.statut as OrderStatus] ||
                    "border-white/10 bg-white/5 text-neutral-300"
                )}
              >
                {STATUS_LABELS[order.statut as OrderStatus] || order.statut}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 font-mono text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span>
                {new Date(order.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grille Principale */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Colonne Principale */}
        <div className="space-y-8">
          {/* Articles Commandés */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
              [ Inventaire ]
            </span>
            <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
              Articles commandés
            </h2>

            <ul className="mt-6 divide-y divide-white/5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-red/10 text-brand-red">
                        <span className="font-mono text-[10px] font-bold uppercase">
                          {item.product.brand.name.slice(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produits/${item.productId}`}
                      target="_blank"
                      className="line-clamp-1 font-sans text-sm font-medium text-white transition-colors hover:text-brand-red"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-neutral-400">
                      {item.product.brand.name} · Quantité : {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-lg font-light text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totaux */}
            <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <dt>Sous-total</dt>
                <dd className="text-white font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-neutral-400">
                <dt>
                  Livraison
                  {order.deliveryDistance != null && (
                    <span className="ml-1 text-[11px] text-neutral-500">
                      ({order.deliveryDistance.toFixed(1)} km)
                    </span>
                  )}
                </dt>
                <dd className="text-white font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400">Offerte</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                  Total TTC
                </dt>
                <dd className="font-display text-3xl font-light text-brand-red">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Informations Client & Livraison */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
              [ Destinataire ]
            </span>
            <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
              Client & livraison
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 font-mono text-xs">
                <p className="flex items-center gap-3 text-white">
                  <UserIcon className="h-4 w-4 shrink-0 text-brand-red" />
                  <span className="font-sans font-medium text-sm">{order.customerName}</span>
                </p>
                <p className="flex items-center gap-3 text-neutral-300">
                  <Mail className="h-4 w-4 shrink-0 text-brand-red" />
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="hover:text-white hover:underline"
                  >
                    {order.customerEmail}
                  </a>
                </p>
                <p className="flex items-center gap-3 text-neutral-300">
                  <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                  <a
                    href={`tel:${order.telephone}`}
                    className="hover:text-white hover:underline"
                  >
                    {order.telephone}
                  </a>
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <p className="flex items-start gap-3 text-neutral-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  <span className="leading-relaxed">{order.adresseLivraison}</span>
                </p>
                {order.deliveryLat != null && order.deliveryLng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-red hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ouvrir la géolocalisation dans Google Maps</span>
                  </a>
                )}
                {order.notes && (
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 italic text-neutral-400">
                    «&nbsp;{order.notes}&nbsp;»
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Panneau de Validation Paiement (WU / Virement) */}
          {order.statut === "EN_ATTENTE" && order.methodePaiement !== "FEDAPAY" && (
            <OrderPaymentPanel
              orderId={order.id}
              methodePaiement={order.methodePaiement}
              currentCodeMTCN={order.codeMTCN}
              currentPreuve={order.preuvePaiement}
            />
          )}
        </div>

        {/* Colonne Latérale */}
        <aside className="space-y-8">
          {/* Détails du Mode de Règlement */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
              [ Transaction ]
            </span>
            <h3 className="mt-1 font-display text-xl font-light tracking-wide text-white">
              Méthode de paiement
            </h3>

            <div className="mt-5 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-brand-red backdrop-blur-md">
                <PaymentIcon className="h-6 w-6" />
              </div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                {payment.label}
              </p>
            </div>

            {order.codeMTCN && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  Code MTCN
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-amber-400">
                  {order.codeMTCN}
                </p>
              </div>
            )}

            {order.preuvePaiement && (
              <a
                href={order.preuvePaiement}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-xs text-brand-red backdrop-blur-md transition-all hover:bg-white/10 hover:underline"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span>Consulter la preuve de virement</span>
              </a>
            )}
          </div>

          {/* Composant de Changement de Statut */}
          <OrderStatusChanger
            orderId={order.id}
            currentStatus={order.statut as OrderStatus}
          />
        </aside>
      </div>
    </div>
  );
}