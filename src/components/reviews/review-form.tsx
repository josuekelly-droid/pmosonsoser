"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
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
        setError(data.error || "Erreur, réessayez.");
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setRating(5);
    } catch {
      setError("Connexion impossible, vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-green-500/30 bg-green-500/5 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 font-display text-2xl tracking-wide text-white">
          Merci pour votre avis !
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Votre témoignage est désormais visible sur la page.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
        >
          Laisser un autre avis
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8"
    >
      {/* Honeypot anti-bot — invisible pour humain */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      {/* Note étoiles */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-white">
          Votre note
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Note ${star} sur 5`}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hover || rating) >= star
                    ? "fill-brand-red text-brand-red"
                    : "text-white/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
            Nom *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={60}
            placeholder="Ex: Amadou K."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-red/50"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium text-white">
            Profil
          </label>
          <input
            id="role"
            name="role"
            maxLength={60}
            placeholder="Ex: Mécanicien"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-red/50"
          />
        </div>
        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-white">
            Ville
          </label>
          <input
            id="city"
            name="city"
            maxLength={60}
            placeholder="Ex: Cotonou"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-red/50"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="text" className="mb-2 block text-sm font-medium text-white">
          Votre témoignage *
        </label>
        <textarea
          id="text"
          name="text"
          required
          minLength={20}
          maxLength={600}
          rows={4}
          placeholder="Racontez votre expérience avec PM Osons Oser..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand-red/50"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          "Publier mon avis"
        )}
      </button>
    </form>
  );
}