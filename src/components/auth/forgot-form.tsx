"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowUpRight, ArrowLeft } from "lucide-react";
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
        setError(data.error || "Erreur lors de l'envoi");
        return;
      }
      setDone(true);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-light text-white">
          Email Envoyé !
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 leading-relaxed">
          Si un compte est associé à cet email, vous recevrez un lien de réinitialisation dans quelques instants.
        </p>
        <p className="mt-2 font-mono text-[11px] text-neutral-500">
          Pensez à vérifier vos dossiers de courrier indésirable (spams).
        </p>
        <div className="mt-8">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
        [ Récupération ]
      </span>
      <h1 className="mt-2 font-display text-3xl font-light text-white">
        Mot de Passe Oublié
      </h1>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Entrez votre adresse email pour recevoir un lien sécurisé de réinitialisation.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Mail className="h-3.5 w-3.5 text-neutral-500" />
            <span>Adresse email</span>
          </label>
          <Input
            name="email"
            type="email"
            required
            placeholder="vous@email.com"
          />
        </div>

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
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <span>Envoyer le lien</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>

        <div className="text-center font-mono text-xs">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </form>
    </div>
  );
}