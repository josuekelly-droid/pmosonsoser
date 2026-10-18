"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  ShoppingBag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AccountType = "B2C" | "B2B";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [typeCompte, setTypeCompte] = useState<AccountType>("B2C");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      typeCompte,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      router.push(
        `/verifier-email?email=${encodeURIComponent(data.email)}`
      );
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <h1 className="font-display text-3xl tracking-wide text-white">
        Créer un compte
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Rejoignez PM Osons Oser en quelques secondes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">

        {/* 🍯 Honeypot - Ne pas supprimer. Invisible pour l'utilisateur. */}
  <input 
    type="text" 
    name="website" 
    tabIndex={-1} 
    autoComplete="off" 
    className="hidden" 
    aria-hidden="true" 
  />


        {/* Type de compte */}
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            active={typeCompte === "B2C"}
            onClick={() => setTypeCompte("B2C")}
            icon={ShoppingBag}
            title="Particulier"
            desc="Achat à l'unité"
          />
          <TypeCard
            active={typeCompte === "B2B"}
            onClick={() => setTypeCompte("B2B")}
            icon={Store}
            title="Professionnel"
            desc="Prix dégressifs"
          />
        </div>

        {/* Nom */}
        <Field icon={UserIcon} label="Nom complet">
          <Input
            name="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Ex: Amadou Kouassi"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </Field>

        {/* Email */}
        <Field icon={Mail} label="Email">
          <Input
            name="email"
            type="email"
            required
            placeholder="vous@email.com"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </Field>

        {/* Téléphone */}
        <Field icon={Phone} label="Téléphone">
          <Input
            name="phone"
            type="tel"
            required
            placeholder="+229 97 00 00 00"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </Field>

        {/* Mot de passe */}
        <Field icon={Lock} label="Mot de passe">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="8 caractères min."
              className="border-white/10 bg-white/5 pr-11 text-white placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Afficher le mot de passe"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-white/40">
            Au moins 8 caractères, une majuscule, une minuscule, un chiffre.
          </p>
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-red text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <p className="text-center text-xs text-white/60">
          Déjà inscrit ?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-brand-red hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/70">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition",
        active
          ? "border-brand-red bg-brand-red/10"
          : "border-white/10 hover:border-white/20"
      )}
    >
      <Icon
        className={cn("h-4 w-4", active ? "text-brand-red" : "text-white/60")}
      />
      <p className="text-xs font-semibold text-white">{title}</p>
      <p className="text-[10px] text-white/50">{desc}</p>
    </button>
  );
}