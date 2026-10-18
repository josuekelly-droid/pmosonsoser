"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ForgotForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      setDone(true);
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 font-display text-3xl tracking-wide text-white">
          Email envoyé !
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Si un compte est associé à cet email, vous recevrez un lien de
          réinitialisation dans quelques instants.
        </p>
        <p className="mt-3 text-xs text-white/40">
          Pensez à vérifier vos spams.
        </p>
        <Link
          href="/connexion"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <h1 className="font-display text-3xl tracking-wide text-white">
        Mot de passe oublié
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Entrez votre email, nous vous enverrons un lien pour le réinitialiser.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Mail className="h-3.5 w-3.5" />
            Email
          </label>
          <Input
            name="email"
            type="email"
            required
            placeholder="vous@email.com"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
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
              Envoi…
            </>
          ) : (
            "Envoyer le lien"
          )}
        </button>

        <p className="text-center text-xs text-white/60">
          <Link href="/connexion" className="hover:text-white">
            ← Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}