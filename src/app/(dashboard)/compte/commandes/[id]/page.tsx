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
  Sparkles,
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
    <div className="space-y-8">
      {/* RETOUR + EN-TÊTE DE COMMANDE */}
      <div className="space-y-4">
        <Link
          href="/compte/commandes"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-300 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Retour à mes commandes</span>
        </Link>

        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                [ Détail de Commande ]
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-light text-white md:text-4xl">
              Commande <span className="font-mono text-brand-red">#{order.orderNumber}</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 font-mono text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span>
                Passée le{" "}
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
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

      {/* TIMELINE DE SUIVI */}
      <OrderTimeline currentStatus={order.statut as OrderStatus} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* COLONNE PRINCIPALE : ARTICLES COMMANDÉS */}
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
            <h2 className="font-display text-2xl font-light text-white mb-6">
              Articles commandés
            </h2>

            <ul className="divide-y divide-white/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-brand-red/20 font-mono text-xs text-neutral-400">
                        {item.product.brand.name.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-medium text-white">
                      {item.product.name}
                    </p>
                    <p className="font-mono text-xs text-neutral-400">
                      {item.product.brand.name} · <span className="text-white">Qté : {item.quantity}</span>
                    </p>

                    {/* 🎨 COULEUR SÉLECTIONNÉE */}
                    {item.colorName && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: item.colorHex || "#888" }}
                        />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                          {item.colorName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-light text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* TOTAUX */}
            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <dt>Sous-total</dt>
                <dd className="text-white font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-neutral-400">
                <dt>Frais de livraison</dt>
                <dd className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400">Offerte</span>
                  ) : (
                    <span className="text-white">{formatPrice(deliveryFee)}</span>
                  )}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-white/10 pt-4 mt-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-neutral-400">Total payé</dt>
                <dd className="font-display text-3xl font-light text-brand-red">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* COLONNE LATÉRALE : PAIEMENT & LIVRAISON */}
        <aside className="space-y-6">
          {/* PAIEMENT */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red block">
              [ Règlement ]
            </span>
            <h3 className="mt-1 font-display text-xl font-light text-white mb-4">
              Mode de paiement
            </h3>

            <div className="flex items-center gap-3.5 mb-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300">
                <PaymentIcon className="h-5 w-5 text-brand-red" />
              </div>
              <p className="font-sans text-sm font-medium text-white">{payment.label}</p>
            </div>

            {order.statut === "EN_ATTENTE" && order.methodePaiement !== "FEDAPAY" && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-mono text-xs text-amber-400 backdrop-blur-md">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider mb-1">Action requise</p>
                  <p className="text-neutral-300">
                    Votre commande est en attente de validation manuelle. Dès réception de la preuve, notre équipe validera l'expédition.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* LIVRAISON */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red block">
              [ Expédition ]
            </span>
            <h3 className="mt-1 font-display text-xl font-light text-white mb-4">
              Adresse de livraison
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <p className="font-sans text-sm font-medium text-white">{order.customerName}</p>
              
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 text-neutral-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <span className="leading-relaxed">{order.adresseLivraison}</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 text-neutral-300">
                <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                <span>{order.telephone}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}