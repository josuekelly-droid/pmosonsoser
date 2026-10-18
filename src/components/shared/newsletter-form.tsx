"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Connexion au serveur impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 font-mono text-xs uppercase tracking-widest text-emerald-400 backdrop-blur-md">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Inclus avec succès. Bienvenue !</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="group relative flex w-full items-center rounded-full border border-white/15 bg-white/[0.03] p-1.5 transition-all duration-500 focus-within:border-brand-red focus-within:bg-white/[0.06] hover:border-white/30"
      >
        {/* 🍯 Honeypot anti-bot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        {/* Input e-mail */}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Entrez votre adresse e-mail..."
          className="h-12 w-full bg-transparent px-6 font-sans text-sm text-white placeholder:text-neutral-500 outline-none"
        />

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="group/btn relative flex h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-brand-red px-7 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          ) : (
            <>
              <span className="hidden sm:inline">S'abonner</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:rotate-45" />
            </>
          )}
        </button>
      </form>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}