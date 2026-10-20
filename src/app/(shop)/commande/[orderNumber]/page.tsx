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
  ArrowUpRight,
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
    email: settings?.email || "pmosonsoser@gmail.com",
    whatsapp: settings?.whatsapp || settings?.phone || "+229 01 96 98 71 09",
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/2 top-1/4 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[160px] pointer-events-none" />

      {/* HERO SECTION DE CONFIRMATION */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
            [ Commande enregistrée ]
          </span>
          <h1 className="mt-1 font-display text-4xl font-light tracking-wide text-white sm:text-5xl">
            Merci pour votre <span className="italic font-serif text-brand-red">commande</span> !
          </h1>
          <p className="mt-2 font-mono text-xs text-neutral-400">
            Votre numéro de référence unique
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-neutral-900/40 px-6 py-2.5 backdrop-blur-2xl">
            <span className="font-mono text-lg font-bold tracking-widest text-brand-red">
              {order.orderNumber}
            </span>
            <Copy className="h-4 w-4 cursor-pointer text-neutral-400 transition-colors hover:text-white" />
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-3xl px-4 md:px-8 space-y-6">
          
          {/* STATUT DE LA COMMANDE */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-sans text-base font-medium text-white">
                    {isPaid
                      ? "Commande confirmée"
                      : isPending
                      ? "En attente de paiement"
                      : order.statut}
                  </p>
                  <p className="font-mono text-xs text-neutral-400 mt-0.5">
                    {isPending
                      ? "Suivez les instructions ci-dessous pour finaliser"
                      : "Nous préparons votre colis avec soin"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* INSTRUCTIONS WESTERN UNION */}
          {isPending && order.methodePaiement === "WESTERN_UNION" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red">
                  <Send className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-light tracking-wide text-white">
                  Paiement Western Union
                </h2>
              </div>

              <ol className="space-y-4 font-mono text-xs md:text-sm text-neutral-300">
                <li className="flex gap-3 items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red font-mono text-xs font-bold text-white shadow-md shadow-brand-red/30">
                    1
                  </span>
                  <span>
                    Rendez-vous dans une agence Western Union et envoyez{" "}
                    <strong className="text-white font-semibold">
                      {formatPrice(order.total)}
                    </strong>{" "}
                    au bénéficiaire suivant :
                  </span>
                </li>
              </ol>

              <dl className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-xs backdrop-blur-md">
                <Row label="Prénom" value={company.wu.firstName} />
                <Row label="Nom" value={company.wu.lastName} />
                <Row label="Ville" value={company.wu.city} />
                <Row label="Pays" value={company.wu.country} />
                <Row
                  label="Montant exact"
                  value={formatPrice(order.total)}
                  highlight
                />
              </dl>

              <p className="mt-6 font-mono text-xs text-neutral-400 leading-relaxed">
                2. Envoyez-nous le code <strong className="text-white">MTCN</strong> et une photo du reçu à{" "}
                <strong className="text-white">{company.email}</strong> ou par WhatsApp au{" "}
                <strong className="text-white">{company.whatsapp}</strong>.
              </p>
            </div>
          )}

          {/* INSTRUCTIONS VIREMENT BANCAIRE */}
          {isPending && order.methodePaiement === "VIREMENT" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-light tracking-wide text-white">
                  Virement bancaire
                </h2>
              </div>

              <p className="font-mono text-xs md:text-sm text-neutral-300">
                Effectuez un virement de{" "}
                <strong className="text-white font-semibold">
                  {formatPrice(order.total)}
                </strong>{" "}
                sur le compte bancaire ci-dessous :
              </p>

              <dl className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-xs backdrop-blur-md">
                <Row label="Banque" value={company.bank.name} />
                <Row label="Titulaire" value={company.bank.holder} />
                <Row label="IBAN / RIB" value={company.bank.iban} mono />
              </dl>

              <p className="mt-6 font-mono text-xs text-neutral-400 leading-relaxed">
                Envoyez ensuite la preuve de virement (PDF ou capture) à{" "}
                <strong className="text-white">{company.email}</strong> ou par WhatsApp au{" "}
                <strong className="text-white">{company.whatsapp}</strong> en mentionnant votre
                numéro de commande <strong className="text-white">#{order.orderNumber}</strong>.
              </p>
            </div>
          )}

          {/* INSTRUCTIONS FEDAPAY (En attente) */}
          {isPending && order.methodePaiement === "FEDAPAY" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
              <h2 className="font-display text-2xl font-light tracking-wide text-white mb-3">
                Paiement Mobile Money
              </h2>
              <p className="font-mono text-xs text-neutral-400">
                Vous allez recevoir un lien de paiement sécurisé FedaPay par email et SMS dans quelques instants. Le règlement s'effectue directement depuis votre téléphone.
              </p>
              <div className="mt-6">
                <PaymentBadges />
              </div>
            </div>
          )}

          {/* ⬇️ SUCCÈS FEDAPAY (Style Dark Luxury) ⬇️ */}
          {order.methodePaiement === "FEDAPAY" && order.statut === "PAYE" && (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-center backdrop-blur-2xl md:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-light tracking-wide text-white">
                Paiement <span className="italic font-serif text-emerald-400">confirmé</span> !
              </h2>
              <p className="mt-2 font-mono text-xs text-neutral-400">
                Votre paiement Mobile Money a bien été reçu. Nous préparons votre commande et vous recevrez un email de confirmation.
              </p>
            </div>
          )}

          {/* RÉCAPITULATIF DE LA COMMANDE */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red block mb-1">
              [ Récapitulatif ]
            </span>
            <h2 className="font-display text-2xl font-light tracking-wide text-white mb-6">
              Détails de la commande
            </h2>

            <ul className="divide-y divide-white/10">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-medium text-white">
                      {i.product.name}
                    </p>
                    <p className="font-mono text-xs text-neutral-400">
                      {i.product.brand.name} · <span className="text-white font-semibold">x{i.quantity}</span>
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-light text-white">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-6 font-mono text-xs">
              <Row label="Sous-total" value={formatPrice(subtotal)} />
              <Row
                label="Livraison"
                value={
                  deliveryFee === 0 ? "Offerte" : formatPrice(deliveryFee)
                }
              />
            </dl>

            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-6">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                Total payé
              </span>
              <span className="font-display text-3xl font-light text-brand-red">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-6 font-mono text-xs md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <p className="font-semibold uppercase tracking-widest text-brand-red mb-2">
                  [ Adresse de livraison ]
                </p>
                <p className="font-sans text-sm font-medium text-white mb-1">{order.customerName}</p>
                <p className="text-neutral-300 leading-relaxed">{order.adresseLivraison}</p>
                <p className="text-neutral-400 mt-1">{order.telephone}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <p className="font-semibold uppercase tracking-widest text-brand-red mb-2">
                  [ Contact & Notes ]
                </p>
                <p className="text-neutral-300 mb-1">{order.customerEmail}</p>
                {order.notes && (
                  <p className="mt-2 text-[11px] italic text-neutral-400">
                    « {order.notes} »
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS DE NAVIGATION */}
          <div className="flex flex-col gap-3.5 sm:flex-row sm:justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-neutral-900/40 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60"
            >
              <Home className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>

            <Link
              href="/motos"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-brand-red/30 bg-brand-red px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black"
            >
              <Package className="h-4 w-4" />
              <span>Continuer mes achats</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </Link>
          </div>

        </div>
      </section>
    </div>
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
      <dt className="text-neutral-400">{label}</dt>
      <dd
        className={[
          "text-right font-medium",
          mono ? "font-mono text-xs" : "",
          highlight ? "text-brand-red font-bold" : "text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}