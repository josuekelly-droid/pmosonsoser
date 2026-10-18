"use client";

import { useState } from "react";
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon,
} from "lucide-react";

type Settings = {
  phone: string | null;
  email: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  whatsapp: string | null;
  baseFee: number;
  pricePerKm: number;
  freeDeliveryThreshold: number;
  maxRadiusKm: number;
  bankName: string | null;
  bankIban: string | null;
  bankHolder: string | null;
  wuFirstName: string | null;
  wuLastName: string | null;
  wuCity: string | null;
  wuCountry: string | null;
};

type FieldErrors = Record<string, string[]>;

export function SettingsForm({ initial }: { initial: Settings }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details && typeof data.details === "object") {
          const details = data.details.fieldErrors || data.details;
          setFieldErrors(details as FieldErrors);

          const firstField = Object.keys(details)[0];
          setError(
            firstField
              ? `Erreur dans le champ "${firstField}" — vérifiez votre saisie.`
              : data.error || "Données invalides"
          );
        } else {
          setError(data.error || "Erreur lors de l'enregistrement");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Connexion impossible au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <Section title="Contact & réseaux sociaux" subtitle="Coordonnées de l'entreprise et liens sociaux publicitaires">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Téléphone"
            name="phone"
            defaultValue={initial.phone}
            placeholder="+229 01 96 98 71 09"
            errors={fieldErrors.phone}
          />
          <Field
            label="Email de contact"
            name="email"
            type="email"
            defaultValue={initial.email}
            placeholder="contact@pmosonsoser.com"
            errors={fieldErrors.email}
          />
          <Field
            label="Adresse physique"
            name="address"
            defaultValue={initial.address}
            placeholder="Cotonou, Bénin"
            className="md:col-span-2"
            errors={fieldErrors.address}
          />
          <Field
            label="Facebook (URL ou identifiant)"
            name="facebook"
            defaultValue={initial.facebook}
            placeholder="facebook.com/pmosonsoser"
            errors={fieldErrors.facebook}
          />
          <Field
            label="Instagram (URL ou identifiant)"
            name="instagram"
            defaultValue={initial.instagram}
            placeholder="instagram.com/pmosonsoser"
            errors={fieldErrors.instagram}
          />
          <Field
            label="Numéro WhatsApp Support"
            name="whatsapp"
            defaultValue={initial.whatsapp}
            placeholder="+229 01 96 98 71 09"
            className="md:col-span-2"
            errors={fieldErrors.whatsapp}
          />
        </div>
      </Section>

      {/* Livraison */}
      <Section title="Paramètres de livraison" subtitle="Tarification dynamique et limites de zone de livraison">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Frais de base (FCFA)"
            name="baseFee"
            type="number"
            defaultValue={String(initial.baseFee)}
            errors={fieldErrors.baseFee}
          />
          <Field
            label="Prix par km (FCFA)"
            name="pricePerKm"
            type="number"
            defaultValue={String(initial.pricePerKm)}
            errors={fieldErrors.pricePerKm}
          />
          <Field
            label="Livraison offerte dès (FCFA)"
            name="freeDeliveryThreshold"
            type="number"
            defaultValue={String(initial.freeDeliveryThreshold)}
            errors={fieldErrors.freeDeliveryThreshold}
          />
          <Field
            label="Rayon maximal de livraison (km)"
            name="maxRadiusKm"
            type="number"
            defaultValue={String(initial.maxRadiusKm)}
            errors={fieldErrors.maxRadiusKm}
          />
        </div>
      </Section>

      {/* Banque */}
      <Section title="Coordonnées bancaires (Virement)" subtitle="Informations transmises aux clients pour les règlements bancaires">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Établissement bancaire"
            name="bankName"
            defaultValue={initial.bankName}
            placeholder="Bank of Africa Bénin"
            errors={fieldErrors.bankName}
          />
          <Field
            label="Titulaire du compte"
            name="bankHolder"
            defaultValue={initial.bankHolder}
            placeholder="PM Osons Oser SARL"
            errors={fieldErrors.bankHolder}
          />
          <Field
            label="IBAN / Numéro RIB"
            name="bankIban"
            defaultValue={initial.bankIban}
            placeholder="BJ66 BJ00 0000…"
            className="md:col-span-2"
            errors={fieldErrors.bankIban}
          />
        </div>
      </Section>

      {/* Western Union */}
      <Section title="Western Union" subtitle="Identité du bénéficiaire pour le transfert de fonds international">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Prénom du bénéficiaire"
            name="wuFirstName"
            defaultValue={initial.wuFirstName}
            errors={fieldErrors.wuFirstName}
          />
          <Field
            label="Nom du bénéficiaire"
            name="wuLastName"
            defaultValue={initial.wuLastName}
            errors={fieldErrors.wuLastName}
          />
          <Field
            label="Ville de retrait"
            name="wuCity"
            defaultValue={initial.wuCity}
            errors={fieldErrors.wuCity}
          />
          <Field
            label="Pays"
            name="wuCountry"
            defaultValue={initial.wuCountry}
            errors={fieldErrors.wuCountry}
          />
        </div>
      </Section>

      {/* Messages de retour */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 font-mono text-xs text-red-400 backdrop-blur-md">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 font-mono text-xs text-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Les paramètres système ont été sauvegardés avec succès.</span>
        </div>
      )}

      {/* Soumission */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="group inline-flex h-14 items-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red px-9 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 3.25rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.4);
          padding: 0 1.25rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.875rem;
          color: #ffffff;
          outline: none;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #ef4444;
        }
        .input-error {
          border-color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.05) !important;
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
        [ Module de configuration ]
      </span>
      <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 font-mono text-xs text-neutral-400 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="mt-6 pt-4 border-t border-white/5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  className,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
  errors?: string[];
}) {
  const hasError = errors && errors.length > 0;
  return (
    <div className={className}>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={`input ${hasError ? "input-error" : ""}`}
      />
      {hasError && (
        <p className="mt-2 font-mono text-xs text-red-400">{errors[0]}</p>
      )}
    </div>
  );
}