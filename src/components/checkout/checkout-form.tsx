"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  Phone,
  User as UserIcon,
  Mail,
  MessageSquare,
  CreditCard,
  Building2,
  Send,
  AlertCircle,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { DELIVERY_PRICING_DEFAULTS, type DeliveryPoint } from "@/lib/delivery";
import { PaymentBadges } from "@/components/shop/payment-badges";
import { MapPicker } from "@/components/shop/map-picker";
import { Input } from "@/components/ui/input";

type Method = "FEDAPAY" | "WESTERN_UNION" | "VIREMENT";

const PAYMENT_METHODS: {
  value: Method;
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    value: "FEDAPAY",
    label: "Mobile Money (FedaPay)",
    desc: "MTN, Moov, Celtiis — paiement immédiat",
    icon: CreditCard,
  },
  {
    value: "WESTERN_UNION",
    label: "Western Union",
    desc: "Transfert international, preuve à envoyer",
    icon: Send,
  },
  {
    value: "VIREMENT",
    label: "Virement bancaire",
    desc: "Preuve de virement à envoyer",
    icon: Building2,
  },
];

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [method, setMethod] = useState<Method>("FEDAPAY");
  const [delivery, setDelivery] = useState<DeliveryPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idempotencyKey = useMemo(() => generateIdempotencyKey(), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ⬇️ CORRECTION : DELIVERY_PRICING_DEFAULTS
  const isFreeDelivery = subtotal >= DELIVERY_PRICING_DEFAULTS.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : (delivery?.fee ?? 0);
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    if (!delivery) {
      setError("Veuillez indiquer votre position sur la carte.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      telephone: formData.get("telephone"),
      adresseLivraison: delivery.address,
      deliveryLat: delivery.coords.lat,
      deliveryLng: delivery.coords.lng,
      deliveryDistance: delivery.distanceKm,
      notes: formData.get("notes") || "",
      methodePaiement: method,
      items: items.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        colorName: i.colorName || "",
        colorHex: i.colorHex || "",
      })),
      idempotencyKey,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la commande");
        setLoading(false);
        return;
      }

      if (method === "FEDAPAY") {
        const paymentRes = await fetch("/api/payment/fedapay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
          setError(paymentData.error || "Erreur d'initialisation du paiement FedaPay");
          setLoading(false);
          return;
        }

        clear();
        window.location.href = paymentData.paymentUrl;
        return;
      }

      clear();
      router.push(`/commande/${data.orderNumber}`);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/40 p-12 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <p className="mt-4 font-display text-xl text-white">
          Votre panier est actuellement vide.
        </p>
        <p className="mt-2 font-mono text-xs text-neutral-500">
          Ajoutez des pièces ou accessoires pour poursuivre le paiement.
        </p>
        <Link
          href="/motos"
          className="group mt-6 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-all duration-300 hover:bg-brand-red hover:text-white"
        >
          <span>Retourner au catalogue</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]"
    >
      {/* COLONNE FORMULAIRE */}
      <div className="space-y-8">
        {/* SECTION 1: COORDONNÉES */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
              [ Étape 01 ]
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-light text-white">
            Vos Coordonnées
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Nom complet *" icon={UserIcon}>
              <Input
                name="customerName"
                required
                minLength={2}
                maxLength={100}
                placeholder="Ex: Amadou Kouassi"
              />
            </Field>

            <Field label="Téléphone *" icon={Phone}>
              <Input
                name="telephone"
                type="tel"
                required
                placeholder="+229 97 00 00 00"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Adresse Email *" icon={Mail}>
                <Input
                  name="customerEmail"
                  type="email"
                  required
                  placeholder="vous@email.com"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* SECTION 2: LIVRAISON */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
              [ Étape 02 ]
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-light text-white">
            Adresse de Livraison
          </h2>

          <p className="mt-1 font-mono text-xs text-neutral-400">
            Cliquez sur la carte interactive pour désigner votre point de livraison. Le tarif est calculé instantanément.
          </p>

          <div className="mt-6">
            <MapPicker subtotal={subtotal} onDeliveryChangeAction={setDelivery} />
          </div>

          <div className="mt-6">
            <Field label="Instructions particulières (facultatif)" icon={MessageSquare}>
              <textarea
                name="notes"
                maxLength={500}
                rows={3}
                placeholder="Remarques, repères de livraison, horaires préférentiels…"
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 hover:border-white/20 focus:border-brand-red focus:bg-white/[0.06] focus:ring-1 focus:ring-brand-red/50"
              />
            </Field>
          </div>

          {!isFreeDelivery ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-mono text-xs text-amber-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                Livraison offerte dès{" "}
                <strong className="text-amber-300">
                  {formatPrice(DELIVERY_PRICING_DEFAULTS.freeDeliveryThreshold)}
                </strong>{" "}
                d'achat.
              </span>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Livraison offerte sur cette commande !</span>
            </div>
          )}
        </section>

        {/* SECTION 3: PAIEMENT */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
              [ Étape 03 ]
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-light text-white">
            Moyen de Paiement
          </h2>

          <div className="mt-6 space-y-3">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300",
                    active
                      ? "border-brand-red bg-brand-red/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
                      active
                        ? "border-brand-red bg-brand-red text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                        : "border-white/10 bg-black/40 text-neutral-400"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-sm font-medium text-white">
                      {m.label}
                    </p>
                    <p className="font-mono text-xs text-neutral-400">{m.desc}</p>
                  </div>

                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      active ? "border-brand-red bg-brand-red" : "border-white/20"
                    )}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* BADGES REGLEMENT */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
            <span className="mb-3 block font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Moyens de Paiement Acceptés
            </span>
            <PaymentBadges />
          </div>
        </section>
      </div>

      {/* COLONNE RÉCAPITULATIF COMMANDE */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
          <span className="block font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
            [ Synthèse ]
          </span>
          <h2 className="mt-1 font-display text-2xl font-light text-white">
            Votre Commande
          </h2>

          <ul className="scrollbar-none mt-6 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 font-mono text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-medium text-white">
                    {i.name}
                  </p>

                  {/* 🎨 COULEUR DANS LE RÉCAP */}
                  {i.colorName && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: i.colorHex || "#888" }}
                      />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        {i.colorName}
                      </span>
                    </div>
                  )}

                  <p className="mt-1 text-neutral-500">Quantité : {i.quantity}</p>
                </div>
                <span className="shrink-0 font-medium text-white">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 font-mono text-xs">
            <div className="flex justify-between text-neutral-400">
              <dt>Sous-total</dt>
              <dd className="font-medium text-white">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-neutral-400">
              <dt>Livraison</dt>
              <dd className="font-medium text-white">
                {!delivery ? (
                  <span className="text-neutral-500">Sélectionner sur la carte</span>
                ) : deliveryFee === 0 ? (
                  <span className="text-emerald-400">Offerte</span>
                ) : (
                  formatPrice(deliveryFee)
                )}
              </dd>
            </div>
            {delivery && (
              <div className="flex justify-between text-[11px] text-neutral-500">
                <dt>Distance calculée</dt>
                <dd>{delivery.distanceKm.toFixed(1)} km</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Total à Régler
            </span>
            <span className="font-display text-3xl font-light text-brand-red">
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !delivery}
            className="group relative mt-8 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-red font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-current" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <span>Confirmer la commande</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </>
            )}
          </button>

          <ul className="mt-6 space-y-2.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
              <span>Paiement chiffré & sécurisé</span>
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-brand-red" />
              <span>Livraison express au Bénin</span>
            </li>
          </ul>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />
        <span>{label}</span>
      </label>
      {children}
    </div>
  );
}