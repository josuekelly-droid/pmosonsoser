"use client";

import { useState } from "react";
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
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
        // Affiche les erreurs champ par champ
        if (data.details && typeof data.details === "object") {
          const details =
            data.details.fieldErrors || data.details;
          setFieldErrors(details as FieldErrors);

          // Message global
          const firstField = Object.keys(details)[0];
          setError(
            firstField
              ? `Erreur dans le champ "${firstField}" — vérifiez votre saisie.`
              : data.error || "Données invalides"
          );
        } else {
          setError(data.error || "Erreur");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact */}
      <Section title="Contact & réseaux sociaux">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Téléphone"
            name="phone"
            defaultValue={initial.phone}
            placeholder="+229 97 00 00 00"
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
            label="Adresse"
            name="address"
            defaultValue={initial.address}
            placeholder="Cotonou, Bénin"
            className="md:col-span-2"
            errors={fieldErrors.address}
          />
          <Field
            label="Facebook (URL ou nom)"
            name="facebook"
            defaultValue={initial.facebook}
            placeholder="facebook.com/pmosonsoser"
            errors={fieldErrors.facebook}
          />
          <Field
            label="Instagram (URL ou nom)"
            name="instagram"
            defaultValue={initial.instagram}
            placeholder="instagram.com/pmosonsoser"
            errors={fieldErrors.instagram}
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            defaultValue={initial.whatsapp}
            placeholder="+229 97 00 00 00"
            className="md:col-span-2"
            errors={fieldErrors.whatsapp}
          />
        </div>
      </Section>

      {/* Livraison */}
      <Section title="Livraison">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            label="Livraison gratuite dès (FCFA)"
            name="freeDeliveryThreshold"
            type="number"
            defaultValue={String(initial.freeDeliveryThreshold)}
            errors={fieldErrors.freeDeliveryThreshold}
          />
          <Field
            label="Rayon max (km)"
            name="maxRadiusKm"
            type="number"
            defaultValue={String(initial.maxRadiusKm)}
            errors={fieldErrors.maxRadiusKm}
          />
        </div>
      </Section>

      {/* Banque */}
      <Section title="Coordonnées bancaires (virement)">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Banque"
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
            label="IBAN / RIB"
            name="bankIban"
            defaultValue={initial.bankIban}
            placeholder="BJ66 BJ00 0000…"
            className="md:col-span-2"
            errors={fieldErrors.bankIban}
          />
        </div>
      </Section>

      {/* WU */}
      <Section title="Western Union">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            label="Ville"
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

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Paramètres enregistrés avec succès.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-red px-7 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </button>
      </div>

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
        .input-error {
          border-color: #dc2626 !important;
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
      <h2 className="font-display text-2xl tracking-wide text-brand-black">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
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
      <label className="mb-2 block text-sm font-medium text-brand-black">
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
        <p className="mt-1.5 text-xs text-red-600">{errors[0]}</p>
      )}
    </div>
  );
}