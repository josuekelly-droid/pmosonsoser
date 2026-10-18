import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Send,
  Building2,
  Clock,
  Download,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderTimeline } from "@/components/client/order-timeline";
import { type OrderStatus } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, { label: string; icon: any }> = {
  FEDAPAY: { label: "Mobile Money (FedaPay)", icon: CreditCard },
  WESTERN_UNION: { label: "Western Union", icon: Send },
  VIREMENT: { label: "Virement bancaire", icon: Building2 },
};

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion?next=/compte/commandes");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { brand: true },
          },
        },
      },
    },
  });

  // Sécurité : La commande doit appartenir au client connecté
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = order.total - subtotal;

  const payment = PAYMENT_LABELS[order.methodePaiement] || {
    label: order.methodePaiement,
    icon: CreditCard,
  };
  const PaymentIcon = payment.icon;

  return (
    <div className="space-y-6">
      {/* Retour + Header */}
      <div>
        <Link
          href="/compte/commandes"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-black/60 transition hover:text-brand-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes commandes
        </Link>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-brand-black">
              Commande {order.orderNumber}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-black/50">
              <Clock className="h-3.5 w-3.5" />
              Passée le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
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

      {/* Timeline de suivi */}
      <OrderTimeline currentStatus={order.statut as OrderStatus} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
        {/* Colonne principale : Articles */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-brand-black/5 bg-white p-6">
            <h2 className="font-display text-xl tracking-wide text-brand-black mb-4">
              Articles commandés
            </h2>
            <ul className="divide-y divide-brand-black/5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
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
                    <p className="line-clamp-1 text-sm font-medium text-brand-black">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-brand-black/50">
                      {item.product.brand.name} · x{item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base text-brand-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totaux */}
            <dl className="mt-6 space-y-2 border-t border-brand-black/5 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-black/60">Sous-total</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-black/60">Livraison</dt>
                <dd className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Offerte</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-brand-black/5 pt-3 mt-3">
                <dt className="font-display text-base text-brand-black">Total</dt>
                <dd className="font-display text-2xl text-brand-red">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Colonne latérale : Infos livraison & paiement */}
        <aside className="space-y-6">
          {/* Paiement */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-6">
            <h3 className="font-display text-lg tracking-wide text-brand-black mb-4">
              Paiement
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gray text-brand-black/60">
                <PaymentIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-brand-black">{payment.label}</p>
            </div>
            
            {order.statut === "EN_ATTENTE" && order.methodePaiement !== "FEDAPAY" && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-semibold mb-1">Action requise</p>
                <p>
                  Votre commande est en attente de validation manuelle. Si vous avez déjà effectué le paiement, nous le vérifions sous peu.
                </p>
              </div>
            )}
          </div>

          {/* Livraison */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-6">
            <h3 className="font-display text-lg tracking-wide text-brand-black mb-4">
              Adresse de livraison
            </h3>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-brand-black">{order.customerName}</p>
              <p className="flex items-start gap-2 text-brand-black/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <span>{order.adresseLivraison}</span>
              </p>
              <p className="flex items-center gap-2 text-brand-black/70">
                <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                <span>{order.telephone}</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}