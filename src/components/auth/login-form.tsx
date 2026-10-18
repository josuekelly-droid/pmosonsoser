"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;
    const honeypot = formData.get("website") as string; // 🍯 Honeypot

    if (honeypot) {
       // Si le bot a rempli le champ caché, on fait semblant de réussir sans rien faire
       setTimeout(() => setError("Email ou mot de passe incorrect."), 1000);
       return;
    }

    try {
      const result = await signIn("credentials", {
        email: emailValue,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          setEmail(emailValue);
          router.push(`/verifier-email?email=${encodeURIComponent(emailValue)}`);
          return;
        }
        setError("Email ou mot de passe incorrect.");
        return;
      }

      // ⬇️ NOUVEAU : Récupérer le rôle et rediriger intelligemment
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      
      if (searchParams.get("next")) {
        router.push(searchParams.get("next")!);
      } else if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/compte");
      }
      
      router.refresh();
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
      <h1 className="font-display text-3xl tracking-wide text-white">
        Se connecter
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Accédez à votre compte PM Osons Oser.
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <Lock className="h-3.5 w-3.5" />
              Mot de passe
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-brand-red hover:underline"
            >
              Oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
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
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>

        <p className="text-center text-xs text-white/60">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-brand-red hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}