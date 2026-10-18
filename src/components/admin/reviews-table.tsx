"use client";

import { useState, useMemo } from "react";
import { Star, Check, Trash2, MessageSquare, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewRow = {
  id: string;
  name: string;
  role: string | null;
  city: string | null;
  rating: number;
  text: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
};

export function ReviewsTable({ initialReviews }: { initialReviews: ReviewRow[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === "approved") return r.isApproved;
      if (filter === "pending") return !r.isApproved;
      return true;
    });
  }, [reviews, filter]);

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.isApproved).length;
    const pending = reviews.filter((r) => !r.isApproved).length;
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    return { approved, pending, avg };
  }, [reviews]);

  async function updateReview(
    id: string,
    updates: Partial<Pick<ReviewRow, "isApproved" | "isFeatured">>
  ) {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Supprimer cet avis définitivement ?")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatPill label="Total avis" value={reviews.length} icon={MessageSquare} />
        <StatPill label="Approuvés" value={stats.approved} icon={Check} accent="green" />
        <StatPill label="En attente" value={stats.pending} icon={EyeOff} accent="amber" />
        <StatPill
          label="Note moyenne"
          value={stats.avg.toFixed(1)}
          icon={Star}
          accent="red"
        />
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-2">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          Tous ({reviews.length})
        </FilterBtn>
        <FilterBtn
          active={filter === "approved"}
          onClick={() => setFilter("approved")}
        >
          Approuvés ({stats.approved})
        </FilterBtn>
        <FilterBtn
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        >
          En attente ({stats.pending})
        </FilterBtn>
      </div>

      {/* LISTE D'AVIS */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/40 py-20 px-4 text-center backdrop-blur-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
            <MessageSquare className="h-8 w-8" />
          </div>
          <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400">
            Aucun avis trouvé dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r) => {
            const isLoading = loading === r.id;
            return (
              <article
                key={r.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-[2.5rem] border bg-neutral-900/40 p-6 backdrop-blur-2xl transition-all duration-300",
                  r.isApproved
                    ? "border-white/10"
                    : "border-amber-500/30 bg-amber-500/[0.03]",
                  isLoading && "opacity-50 pointer-events-none"
                )}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 font-display text-lg font-light text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium text-white">
                          {r.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                          {r.role}
                          {r.city ? ` · ${r.city}` : ""} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      {!r.isApproved && (
                        <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
                          En attente
                        </span>
                      )}
                      {r.isFeatured && (
                        <span className="rounded-xl border border-brand-red/30 bg-brand-red/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand-red backdrop-blur-md">
                          Vedette
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Étoiles */}
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-700"
                        )}
                      />
                    ))}
                  </div>

                  {/* Texte */}
                  <p className="mt-4 font-mono text-xs md:text-sm leading-relaxed text-neutral-300 italic">
                    «&nbsp;{r.text}&nbsp;»
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                  {!r.isApproved ? (
                    <button
                      onClick={() => updateReview(r.id, { isApproved: true })}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-600 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approuver</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReview(r.id, { isApproved: false })}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-400 backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Masquer</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      updateReview(r.id, { isFeatured: !r.isFeatured })
                    }
                    disabled={isLoading}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50",
                      r.isFeatured
                        ? "border-brand-red/30 bg-brand-red/10 text-brand-red backdrop-blur-md"
                        : "border-white/10 bg-white/5 text-neutral-300 backdrop-blur-md hover:border-brand-red/50 hover:text-white"
                    )}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", r.isFeatured && "fill-current")}
                    />
                    <span>{r.isFeatured ? "Vedette" : "Mettre en vedette"}</span>
                  </button>

                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={isLoading}
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50"
                    aria-label="Supprimer l'avis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "red" | "green" | "amber";
}) {
  const color =
    accent === "green"
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : accent === "amber"
      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
      : accent === "red"
      ? "text-brand-red border-brand-red/30 bg-brand-red/10"
      : "text-white border-white/10 bg-white/5";

  return (
    <div className="flex items-center gap-4 rounded-[2rem] border border-white/10 bg-neutral-900/40 p-5 backdrop-blur-2xl">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-md", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          {label}
        </p>
        <p className="font-display text-2xl font-light tracking-wide text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300",
        active
          ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30"
          : "border-white/10 bg-neutral-900/40 text-neutral-400 backdrop-blur-md hover:border-brand-red/50 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}