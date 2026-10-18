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
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { DELIVERY_PRICING, type DeliveryPoint } from "@/lib/delivery";
import { PaymentBadges } from "@/components/shop/payment-badges";
import { MapPicker } from "@/components/shop/map-picker";

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

  // Frais de livraison : on utilise DIRECTEMENT le fee retourné par MapPicker
  // (calculé par l'API ORS + calculateDeliveryFee côté serveur).
  const isFreeDelivery = subtotal >= DELIVERY_PRICING.freeDeliveryThreshold;
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
      items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
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
        return;
      }

      clear();
      router.push(`/commande/${data.orderNumber}`);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-black/10 bg-white p-10 text-center">
        <p className="text-brand-black/70">
          Votre panier est vide.{" "}
          <Link
            href="/motos"
            className="font-semibold text-brand-red hover:underline"
          >
            Retourner au catalogue
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
    >
      {/* Colonne formulaire */}
      <div className="space-y-6">
        {/* Coordonnées */}
        <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
            <UserIcon className="h-5 w-5 text-brand-red" />
            Vos coordonnées
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nom complet *" icon={UserIcon}>
              <input
                name="customerName"
                required
                minLength={2}
                maxLength={100}
                placeholder="Ex: Amadou Kouassi"
                className="input"
              />
            </Field>

            <Field label="Téléphone *" icon={Phone}>
              <input
                name="telephone"
                type="tel"
                required
                placeholder="+229 97 00 00 00"
                className="input"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Email *" icon={Mail}>
                <input
                  name="customerEmail"
                  type="email"
                  required
                  placeholder="vous@email.com"
                  className="input"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Livraison (carte) */}
        <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
            <MapPin className="h-5 w-5 text-brand-red" />
            Adresse de livraison
          </h2>

          <p className="mt-2 text-xs text-brand-black/60">
            Cliquez sur la carte pour indiquer votre position exacte. Les frais
            de livraison sont calculés en temps réel selon la distance.
          </p>

          <div className="mt-5">
            <MapPicker subtotal={subtotal} onDeliveryChangeAction={setDelivery} />
          </div>

          <div className="mt-4">
            <Field label="Notes (facultatif)" icon={MessageSquare}>
              <textarea
                name="notes"
                maxLength={500}
                rows={2}
                placeholder="Instructions particulières, préférence horaire…"
                className="input resize-none"
              />
            </Field>
          </div>

          {!isFreeDelivery ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              💡 Livraison offerte dès{" "}
              {formatPrice(DELIVERY_PRICING.freeDeliveryThreshold)} d'achat.
            </p>
          ) : (
            <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-xs text-green-800">
              🎉 Vous bénéficiez de la livraison offerte !
            </p>
          )}
        </section>

        {/* Paiement */}
        <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-brand-black">
            <CreditCard className="h-5 w-5 text-brand-red" />
            Moyen de paiement
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
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition",
                    active
                      ? "border-brand-red bg-brand-red/5"
                      : "border-brand-black/5 hover:border-brand-black/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition",
                      active
                        ? "bg-brand-red text-white"
                        : "bg-brand-gray text-brand-black"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-black">
                      {m.label}
                    </p>
                    <p className="text-xs text-brand-black/60">{m.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                      active ? "border-brand-red" : "border-brand-black/20"
                    )}
                  >
                    {active && (
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-brand-gray/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-black/50">
              Moyens acceptés
            </p>
            <PaymentBadges />
          </div>
        </section>
      </div>

      {/* Colonne récap */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-7">
          <h2 className="font-display text-2xl tracking-wide text-brand-black">
            Votre commande
          </h2>

          <ul className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-black">
                    {i.name}
                  </p>
                  <p className="text-xs text-brand-black/50">x{i.quantity}</p>
                </div>
                <span className="shrink-0 font-medium text-brand-black">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-brand-black/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-black/60">Sous-total</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-black/60">Livraison</dt>
              <dd className="font-medium">
                {!delivery ? (
                  <span className="text-xs text-brand-black/50">
                    À calculer
                  </span>
                ) : deliveryFee === 0 ? (
                  <span className="text-green-700">Offerte</span>
                ) : (
                  formatPrice(deliveryFee)
                )}
              </dd>
            </div>
            {delivery && (
              <div className="flex justify-between text-xs text-brand-black/50">
                <dt>Distance</dt>
                <dd>{delivery.distanceKm.toFixed(1)} km</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex items-end justify-between border-t border-brand-black/10 pt-5">
            <span className="font-display text-lg tracking-wide text-brand-black">
              Total
            </span>
            <span className="font-display text-3xl tracking-wide text-brand-red">
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !delivery}
            className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-red text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement…
              </>
            ) : (
              <>Confirmer la commande</>
            )}
          </button>

          <ul className="mt-5 space-y-2.5 text-xs text-brand-black/60">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
              Données chiffrées et sécurisées
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-brand-red" />
              Livraison partout au Bénin
            </li>
          </ul>
        </div>
      </aside>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 3rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(26, 26, 26, 0.1);
          background: #fff;
          padding: 0 1rem;
          font-size: 0.875rem;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #e30613;
        }
        textarea.input {
          height: auto;
          padding: 0.75rem 1rem;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
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
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
        <Icon className="h-3.5 w-3.5 text-brand-black/40" />
        {label}
      </label>
      {children}
    </div>
  );
}