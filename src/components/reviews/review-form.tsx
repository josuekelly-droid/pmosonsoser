"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle2, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      role: formData.get("role"),
      city: formData.get("city"),
      rating,
      text: formData.get("text"),
      honeypot: formData.get("website"), // honeypot
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur s'est produite, veuillez réessayer.");
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setRating(5);
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/60 p-10 text-center backdrop-blur-xl md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
        
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h3 className="mt-6 font-display text-3xl font-light text-white md:text-4xl">
          Merci pour votre <span className="italic font-serif font-normal text-emerald-400">témoignage</span>
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
          Votre avis a été transmis avec succès. Il apparaîtra publiquement après validation par notre équipe.
        </p>

        <button
          onClick={() => setSuccess(false)}
          type="button"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
        >
          <span>Laisser un autre avis</span>
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
      {/* Honeypot anti-bot */}
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
          [ Formulaire d'Évaluation ]
        </span>
        <h3 className="mt-2 font-display text-2xl font-light text-white md:text-3xl">
          Partagez votre <span className="italic font-serif font-normal text-neutral-400">expérience</span>
        </h3>
      </div>

      {/* Système de notation par étoiles */}
      <div className="mb-8">
        <label className="mb-3 block font-mono text-xs uppercase tracking-widest text-neutral-400">
          Votre Note Globale *
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Note ${star} sur 5`}
                className="group relative p-1 outline-none transition-transform duration-200 hover:scale-125"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors duration-300",
                    (hover || rating) >= star
                      ? "fill-brand-red text-brand-red drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      : "text-neutral-700 hover:text-neutral-500"
                  )}
                />
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-neutral-400">
            ({hover || rating} / 5)
          </span>
        </div>
      </div>

      {/* Inputs principaux */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="name" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
            Nom Complet *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={60}
            placeholder="Ex: Amadou K."
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
            Activité / Profession
          </label>
          <input
            id="role"
            name="role"
            maxLength={60}
            placeholder="Ex: Mécanicien Pro"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
            Ville / Localité
          </label>
          <input
            id="city"
            name="city"
            maxLength={60}
            placeholder="Ex: Cotonou"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
          />
        </div>
      </div>

      {/* Zone Témoignage */}
      <div className="mt-6">
        <label htmlFor="text" className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-400">
          Votre Témoignage *
        </label>
        <textarea
          id="text"
          name="text"
          required
          minLength={20}
          maxLength={600}
          rows={5}
          placeholder="Racontez votre expérience avec PM Osons Oser (qualité du matériel, rapidité de livraison, service après-vente...)"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 font-sans text-sm text-white placeholder:text-neutral-600 outline-none transition-all duration-300 focus:border-brand-red focus:bg-white/[0.05] focus:ring-1 focus:ring-brand-red"
        />
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Bouton d'action Awwwards */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-brand-red px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/20 transition-all duration-500 hover:bg-white hover:text-black hover:shadow-brand-red/40 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-current" />
              Transmission en cours...
            </span>
          ) : (
            <>
              <span>Publier mon témoignage</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}