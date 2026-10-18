"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, ArrowUpRight, Sparkles, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          website: formData.get("website"), // Honeypot
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Une erreur est survenue lors de l'envoi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/60 p-10 text-center backdrop-blur-xl md:p-14">
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h3 className="mt-6 font-display text-3xl font-light text-white md:text-4xl">
          Message <span className="italic font-serif font-normal text-emerald-400">transmis !</span>
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
          Nous avons bien reçu votre demande. Notre équipe vous recontactera dans les plus brefs délais.
        </p>

        <button
          onClick={() => setSuccess(false)}
          type="button"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          <span>Envoyer un autre message</span>
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-xl transition-colors duration-500 hover:border-white/20 md:p-12"
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

      {/* Header du formulaire */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-brand-red">
          [ Nous Contacter ]
        </span>
        <h3 className="mt-2 font-display text-2xl font-light text-white md:text-3xl">
          Laissez-nous un <span className="italic font-serif font-normal text-neutral-400">message</span>
        </h3>
      </div>

      <div className="space-y-6">
        {/* Nom & Email */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
              Nom Complet *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex: Jean-Baptiste K."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
              Adresse E-mail *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
            />
          </div>
        </div>

        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
            Sujet de votre demande *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="Ex: Demande de cotation flotte B2B / Info véhicule"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
            Votre Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Détaillez votre besoin ou question..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-mono text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Submit */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-brand-red px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-current" />
              Envoi en cours...
            </span>
          ) : (
            <>
              <span>Envoyer le message</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}