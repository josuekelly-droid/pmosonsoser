"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: formData.get("website"), // Honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }

      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-full bg-green-500/10 px-5 text-base font-medium text-green-400 md:ml-auto md:max-w-md">
        <CheckCircle2 className="h-5 w-5" />
        Merci pour votre inscription !
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 md:max-w-md md:flex-row md:items-center md:gap-3 md:ml-auto"
    >
      {/* 🍯 Honeypot anti-bot */}
      <input 
        type="text" 
        name="website" 
        tabIndex={-1} 
        autoComplete="off" 
        className="hidden" 
        aria-hidden="true" 
      />

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        className="min-h-[64px] w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-white/50 outline-none transition focus:border-brand-red focus:bg-white/15 md:min-h-[56px] md:h-14 md:py-0 md:text-sm"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="group inline-flex min-h-[64px] w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 text-base font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50 md:min-h-[56px] md:h-14 md:w-auto md:text-sm"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            S'inscrire
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 md:absolute md:bottom-0">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </form>
  );
}