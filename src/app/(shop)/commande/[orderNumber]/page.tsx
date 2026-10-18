import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Copy,
  Building2,
  Send,
  Home,
  Package,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { PaymentBadges } from "@/components/shop/payment-badges";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return constructMetadata({
    title: `Commande ${orderNumber}`,
    pathname: `/commande/${orderNumber}`,
    noIndex: true,
  });
}

export default async function CommandePage({ params }: Props) {
  const { orderNumber } = await params;

  // 1. Récupérer la commande
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { include: { brand: true } } } },
    },
  });

  if (!order) notFound();

  // 2. Récupérer les paramètres de l'entreprise (Settings)
  const settings = await prisma.settings.findUnique({
    where: { id: "global" },
  });

  // 3. Valeurs de secours (fallback) si l'admin n'a pas encore configuré
  const company = {
    email: settings?.email || "contact@pmosonsoser.com",
    whatsapp: settings?.whatsapp || settings?.phone || "+229 XX XX XX XX",
    bank: {
      name: settings?.bankName || "Nom de la banque",
      iban: settings?.bankIban || "IBAN / RIB non configuré",
      holder: settings?.bankHolder || "PM Osons Oser",
    },
    wu: {
      firstName: settings?.wuFirstName || "Prénom",
      lastName: settings?.wuLastName || "Nom",
      city: settings?.wuCity || "Cotonou",
      country: settings?.wuCountry || "Bénin",
    },
  };

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = order.total - subtotal;

  const isPending = order.statut === "EN_ATTENTE";
  const isPaid = order.statut === "PAYE";

  return (
    <>
      <section className="relative overflow-hidden bg-brand-black pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="pointer-events-none absolute -top-32 right-0 h-[300px] w-[400px] rounded-full bg-brand-red/10 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-wide text-white sm:text-5xl">
            Merci pour votre commande !
          </h1>
          <p className="mt-3 text-white/70">
            Votre numéro de commande
          </p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 backdrop-blur-sm">
            <span className="font-display text-xl tracking-widest text-brand-red">
              {order.orderNumber}
            </span>
            <Copy className="h-4 w-4 cursor-pointer text-white/50" />
          </div>
        </div>
      </section>

      <section className="bg-brand-gray py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          {/* Statut */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-black">
                    {isPaid
                      ? "Commande confirmée"
                      : isPending
                      ? "En attente de paiement"
                      : order.statut}
                  </p>
                  <p className="text-xs text-brand-black/60">
                    {isPending
                      ? "Suivez les instructions ci-dessous pour finaliser"
                      : "Nous préparons votre commande"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Western Union */}
          {isPending && order.methodePaiement === "WESTERN_UNION" && (
            <div className="mt-6 rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
                <Send className="h-5 w-5 text-brand-red" />
                Paiement Western Union
              </h2>
              <ol className="mt-5 space-y-4 text-sm text-brand-black/80">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Rendez-vous dans une agence Western Union et envoyez{" "}
                    <strong className="text-brand-black">
                      {formatPrice(order.total)}
                    </strong>{" "}
                    au bénéficiaire suivant :
                  </span>
                </li>
              </ol>

              <dl className="mt-4 space-y-2 rounded-2xl bg-brand-gray/50 p-5 text-sm">
                <Row label="Prénom" value={company.wu.firstName} />
                <Row label="Nom" value={company.wu.lastName} />
                <Row label="Ville" value={company.wu.city} />
                <Row label="Pays" value={company.wu.country} />
                <Row
                  label="Montant"
                  value={formatPrice(order.total)}
                  highlight
                />
              </dl>

              <p className="mt-5 text-sm text-brand-black/70">
                2. Envoyez-nous le code <strong>MTCN</strong> et une photo du reçu à{" "}
                <strong>{company.email}</strong> ou par WhatsApp au{" "}
                <strong>{company.whatsapp}</strong>.
              </p>
            </div>
          )}

          {/* Instructions Virement */}
          {isPending && order.methodePaiement === "VIREMENT" && (
            <div className="mt-6 rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
                <Building2 className="h-5 w-5 text-brand-red" />
                Virement bancaire
              </h2>
              <p className="mt-4 text-sm text-brand-black/70">
                Effectuez un virement de{" "}
                <strong className="text-brand-black">
                  {formatPrice(order.total)}
                </strong>{" "}
                sur le compte ci-dessous :
              </p>

              <dl className="mt-4 space-y-2 rounded-2xl bg-brand-gray/50 p-5 text-sm">
                <Row label="Banque" value={company.bank.name} />
                <Row label="Titulaire" value={company.bank.holder} />
                <Row label="IBAN" value={company.bank.iban} mono />
              </dl>

              <p className="mt-5 text-sm text-brand-black/70">
                Envoyez ensuite la preuve de virement (PDF ou capture) à{" "}
                <strong>{company.email}</strong> ou par WhatsApp au{" "}
                <strong>{company.whatsapp}</strong> en mentionnant votre
                numéro de commande <strong>{order.orderNumber}</strong>.
              </p>
            </div>
          )}

          {/* Instructions FedaPay */}
          {isPending && order.methodePaiement === "FEDAPAY" && (
            <div className="mt-6 rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
                Paiement Mobile Money
              </h2>
              <p className="mt-4 text-sm text-brand-black/70">
                Vous allez recevoir un lien de paiement FedaPay par email et SMS
                dans quelques instants. Le paiement se fait directement depuis
                votre téléphone.
              </p>
              <div className="mt-5">
                <PaymentBadges />
              </div>
            </div>
          )}

          {/* Récap commande */}
          <div className="mt-6 rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
            <h2 className="font-display text-2xl tracking-wide text-brand-black">
              Détails de la commande
            </h2>

            <ul className="mt-5 divide-y divide-brand-black/5">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-black">
                      {i.product.name}
                    </p>
                    <p className="text-xs text-brand-black/50">
                      {i.product.brand.name} · x{i.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium text-brand-black">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-brand-black/10 pt-5 text-sm">
              <Row label="Sous-total" value={formatPrice(subtotal)} />
              <Row
                label="Livraison"
                value={
                  deliveryFee === 0 ? "Offerte" : formatPrice(deliveryFee)
                }
              />
            </dl>

            <div className="mt-5 flex items-end justify-between border-t border-brand-black/10 pt-5">
              <span className="font-display text-lg tracking-wide text-brand-black">
                Total
              </span>
              <span className="font-display text-3xl tracking-wide text-brand-red">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-brand-black/5 pt-6 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-black/40">
                  Livraison à
                </p>
                <p className="mt-1 text-brand-black">{order.customerName}</p>
                <p className="text-brand-black/70">{order.adresseLivraison}</p>
                <p className="text-brand-black/70">{order.telephone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-black/40">
                  Contact
                </p>
                <p className="mt-1 text-brand-black/70">{order.customerEmail}</p>
                {order.notes && (
                  <p className="mt-2 text-xs italic text-brand-black/60">
                    « {order.notes} »
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-black/10 bg-white px-6 py-3 text-sm font-semibold text-brand-black transition hover:border-brand-red/30"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <Link
              href="/motos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90"
            >
              <Package className="h-4 w-4" />
              Continuer mes achats
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-brand-black/60">{label}</dt>
      <dd
        className={[
          "text-right font-medium",
          mono ? "font-mono text-xs" : "",
          highlight ? "text-brand-red" : "text-brand-black",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}