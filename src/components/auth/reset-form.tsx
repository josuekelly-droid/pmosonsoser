"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 font-display text-2xl tracking-wide text-white">
          Lien invalide
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Ce lien est invalide ou a expiré.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline"
        >
          Refaire une demande
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2500);
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 font-display text-3xl tracking-wide text-white">
          Mot de passe modifié !
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Redirection vers la connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <h1 className="font-display text-3xl tracking-wide text-white">
        Nouveau mot de passe
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Choisissez un mot de passe sécurisé.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Lock className="h-3.5 w-3.5" />
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder="8 caractères min."
              className="border-white/10 bg-white/5 pr-11 text-white placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Lock className="h-3.5 w-3.5" />
            Confirmer
          </label>
          <div className="relative">
            <Input
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              className="border-white/10 bg-white/5 pr-11 text-white placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

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
              Modification…
            </>
          ) : (
            "Modifier le mot de passe"
          )}
        </button>
      </form>
    </div>
  );
}