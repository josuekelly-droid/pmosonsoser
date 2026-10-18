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
  ArrowUpRight,
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
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
        [ Inscription ]
      </span>
      <h1 className="mt-2 font-display text-3xl font-light text-white">
        Créer un Compte
      </h1>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Rejoignez l'écosystème PM Osons Oser en quelques secondes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* 🍯 Honeypot - Invisible pour l'utilisateur, ne pas supprimer */}
        <input 
          type="text" 
          name="website" 
          tabIndex={-1} 
          autoComplete="off" 
          className="hidden" 
          aria-hidden="true" 
        />

        {/* TYPE DE COMPTE */}
        <div className="grid grid-cols-2 gap-4">
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
            desc="Tarifs grossistes"
          />
        </div>

        {/* NOM */}
        <Field icon={UserIcon} label="Nom complet">
          <Input
            name="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Ex: Amadou Kouassi"
          />
        </Field>

        {/* EMAIL */}
        <Field icon={Mail} label="Adresse email">
          <Input
            name="email"
            type="email"
            required
            placeholder="vous@email.com"
          />
        </Field>

        {/* TÉLÉPHONE */}
        <Field icon={Phone} label="Téléphone">
          <Input
            name="phone"
            type="tel"
            required
            placeholder="+229 97 00 00 00"
          />
        </Field>

        {/* MOT DE PASSE */}
        <Field icon={Lock} label="Mot de passe">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Afficher le mot de passe"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 font-mono text-[11px] text-neutral-500">
            Au moins 8 caractères, incluant majuscules, minuscules et chiffres.
          </p>
        </Field>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-red font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-current" />
              <span>Création du compte...</span>
            </>
          ) : (
            <>
              <span>Créer mon compte</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>

        <p className="text-center font-mono text-xs text-neutral-400">
          Déjà inscrit ?{" "}
          <Link
            href="/connexion"
            className="font-bold text-brand-red transition-colors hover:text-white"
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
      <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />
        <span>{label}</span>
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
        "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300",
        active
          ? "border-brand-red bg-brand-red/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300",
          active
            ? "border-brand-red bg-brand-red text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            : "border-white/10 bg-black/40 text-neutral-400"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-sans text-sm font-medium text-white">{title}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          {desc}
        </p>
      </div>
    </button>
  );
}