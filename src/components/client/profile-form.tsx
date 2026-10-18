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
        // Si erreur de validation spécifique (ex: mot de passe requis)
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
      (e.target as HTMLFormElement).reset(); // Vide les champs (surtout les mots de passe)
      router.refresh(); // Met à jour l'interface (avatar, nom dans la sidebar)
      
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1 : Infos personnelles */}
      <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
        <h2 className="font-display text-xl tracking-wide text-brand-black">
          Informations personnelles
        </h2>
        
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Nom */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
              <UserIcon className="h-3.5 w-3.5 text-brand-black/40" />
              Nom complet
            </label>
            <Input
              name="name"
              required
              defaultValue={initialData.name || ""}
              className="border-brand-black/10 bg-brand-gray/30 focus:border-brand-red"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
              <Phone className="h-3.5 w-3.5 text-brand-black/40" />
              Téléphone
            </label>
            <Input
              name="phone"
              defaultValue={initialData.phone || ""}
              placeholder="+229 97 00 00 00"
              className="border-brand-black/10 bg-brand-gray/30 focus:border-brand-red"
            />
          </div>

          {/* Email (lecture seule) */}
          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
              <Mail className="h-3.5 w-3.5 text-brand-black/40" />
              Adresse email
            </label>
            <Input
              disabled
              defaultValue={initialData.email}
              className="cursor-not-allowed border-brand-black/5 bg-brand-gray text-brand-black/50"
            />
            <p className="mt-1.5 text-xs text-brand-black/40">
              L'adresse email ne peut pas être modifiée pour des raisons de sécurité.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 : Sécurité */}
      <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
        <h2 className="font-display text-xl tracking-wide text-brand-black">
          Sécurité (Changer de mot de passe)
        </h2>
        <p className="mt-1 text-xs text-brand-black/50">
          Laissez vide si vous ne souhaitez pas modifier votre mot de passe.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Ancien mot de passe */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
              <Lock className="h-3.5 w-3.5 text-brand-black/40" />
              Mot de passe actuel
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                placeholder="••••••••"
                className="border-brand-black/10 bg-brand-gray/30 pr-10 focus:border-brand-red"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-black"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-black">
              <Lock className="h-3.5 w-3.5 text-brand-black/40" />
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder="8 caractères min."
                className="border-brand-black/10 bg-brand-gray/30 pr-10 focus:border-brand-red"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-black"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Profil mis à jour avec succès.</span>
        </div>
      )}

      {/* Bouton */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}