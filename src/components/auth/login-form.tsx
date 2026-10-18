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
  ArrowUpRight,
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

      // Récupérer le rôle et rediriger intelligemment
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
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
        [ Authentification ]
      </span>
      <h1 className="mt-2 font-display text-3xl font-light text-white">
        Se Connecter
      </h1>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Accédez à votre espace sécurisé PM Osons Oser.
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

        {/* EMAIL */}
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

        {/* MOT DE PASSE */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-neutral-500" />
              <span>Mot de passe</span>
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="font-mono text-xs text-brand-red transition-colors hover:text-white"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
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
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <span>Se connecter</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>

        <p className="text-center font-mono text-xs text-neutral-400">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-bold text-brand-red transition-colors hover:text-white"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}