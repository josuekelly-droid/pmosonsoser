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
  ArrowUpRight,
  ShieldAlert,
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
      <div className="relative overflow-hidden rounded-[2.5rem] border border-red-500/30 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <span className="mt-4 block font-mono text-xs uppercase tracking-[0.25em] text-red-400">
          [ Erreur de Jeton ]
        </span>
        <h1 className="mt-2 font-display text-2xl font-light text-white">
          Lien Invalide ou Expiré
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 leading-relaxed">
          Le lien de réinitialisation que vous avez utilisé n'est plus valide.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="group mt-6 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-all duration-300 hover:bg-brand-red hover:text-white"
        >
          <span>Refaire une demande</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
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
        setError(data.error || "Erreur lors de la modification");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2500);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-light text-white">
          Mot de passe modifié !
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
          Redirection vers la page de connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
        [ Sécurité ]
      </span>
      <h1 className="mt-2 font-display text-3xl font-light text-white">
        Nouveau Mot de Passe
      </h1>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Choisissez un nouveau mot de passe sécurisé à 8 caractères minimum.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Lock className="h-3.5 w-3.5 text-neutral-500" />
            <span>Nouveau mot de passe</span>
          </label>
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
            <Lock className="h-3.5 w-3.5 text-neutral-500" />
            <span>Confirmer le mot de passe</span>
          </label>
          <div className="relative">
            <Input
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              minLength={8}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
              <span>Modification en cours...</span>
            </>
          ) : (
            <>
              <span>Modifier le mot de passe</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}