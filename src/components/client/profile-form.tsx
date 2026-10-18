"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type ProfileData = {
  name: string | null;
  email: string;
  phone: string | null;
};

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion de l'affichage des mots de passe
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    };

    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        let firstError: string | null = null;

        if (data.details) {
          const details = data.details as Record<string, string[]>;
          const firstField = Object.keys(details)[0];
          if (firstField && details[firstField]?.length > 0) {
            firstError = details[firstField][0];
          }
        }

        setError(firstError || data.error || "Erreur lors de la mise à jour");
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();

      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-xl md:p-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
            [ Profil ]
          </span>
        </div>
        <h2 className="mt-1 font-display text-2xl font-light text-white">
          Informations personnelles
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nom */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <UserIcon className="h-3.5 w-3.5 text-neutral-500" />
              <span>Nom complet</span>
            </label>
            <Input
              name="name"
              required
              defaultValue={initialData.name || ""}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span>Téléphone</span>
            </label>
            <Input
              name="phone"
              defaultValue={initialData.phone || ""}
              placeholder="+229 97 00 00 00"
            />
          </div>

          {/* Email (Lecture seule) */}
          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Mail className="h-3.5 w-3.5 text-neutral-500" />
              <span>Adresse email</span>
            </label>
            <Input
              disabled
              defaultValue={initialData.email}
              className="cursor-not-allowed border-white/5 bg-white/[0.02] text-neutral-500 opacity-60"
            />
            <p className="mt-2 font-mono text-[11px] text-neutral-500">
              L'adresse email ne peut pas être modifiée pour des raisons de sécurité.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 : SÉCURITÉ */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-xl md:p-8">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
            [ Sécurité ]
          </span>
        </div>
        <h2 className="mt-1 font-display text-2xl font-light text-white">
          Changer de mot de passe
        </h2>
        <p className="mt-1 font-mono text-xs text-neutral-500">
          Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Ancien mot de passe */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-neutral-500" />
              <span>Mot de passe actuel</span>
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-neutral-500" />
              <span>Nouveau mot de passe</span>
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder="8 caractères min."
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACKS */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Profil mis à jour avec succès.</span>
        </div>
      )}

      {/* BOUTON ENREGISTRER */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-brand-red px-8 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
              <span>Enregistrer les modifications</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}