"use client";

import { useState, useMemo } from "react";
import { Star, Check, X, Star as StarFill, Trash2, MessageSquare, Eye, EyeOff } from "lucide-react";
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
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill label="Total" value={reviews.length} icon={MessageSquare} />
        <StatPill label="Approuvés" value={stats.approved} icon={Check} accent="green" />
        <StatPill label="En attente" value={stats.pending} icon={EyeOff} accent="amber" />
        <StatPill
          label="Note moyenne"
          value={stats.avg.toFixed(1)}
          icon={Star}
          accent="red"
        />
      </div>

      {/* Filtres */}
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

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-black/10 bg-white py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-brand-black/20" />
          <p className="mt-3 text-sm text-brand-black/50">
            Aucun avis dans cette catégorie.
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
                  "relative flex flex-col rounded-2xl border bg-white p-5 transition",
                  r.isApproved
                    ? "border-brand-black/5"
                    : "border-amber-300 bg-amber-50/30",
                  isLoading && "opacity-50"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 font-display text-base text-brand-red">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-black">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-brand-black/50">
                        {r.role}
                        {r.city ? ` · ${r.city}` : ""} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {!r.isApproved && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                        En attente
                      </span>
                    )}
                    {r.isFeatured && (
                      <span className="rounded-full bg-brand-red/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-red">
                        Vedette
                      </span>
                    )}
                  </div>
                </div>

                {/* Étoiles */}
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < r.rating
                          ? "fill-brand-red text-brand-red"
                          : "text-brand-black/15"
                      )}
                    />
                  ))}
                </div>

                {/* Texte */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-black/80">
                  "{r.text}"
                </p>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-black/5 pt-4">
                  {!r.isApproved ? (
                    <button
                      onClick={() => updateReview(r.id, { isApproved: true })}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approuver
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReview(r.id, { isApproved: false })}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Masquer
                    </button>
                  )}

                  <button
                    onClick={() =>
                      updateReview(r.id, { isFeatured: !r.isFeatured })
                    }
                    disabled={isLoading}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50",
                      r.isFeatured
                        ? "border-brand-red bg-brand-red/10 text-brand-red"
                        : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-red/30"
                    )}
                  >
                    <StarFill
                      className={cn("h-3.5 w-3.5", r.isFeatured && "fill-current")}
                    />
                    {r.isFeatured ? "Vedette" : "Mettre en vedette"}
                  </button>

                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={isLoading}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
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
  icon: any;
  accent?: "red" | "green" | "amber";
}) {
  const color =
    accent === "green"
      ? "text-green-600 bg-green-500/10"
      : accent === "amber"
      ? "text-amber-600 bg-amber-500/10"
      : accent === "red"
      ? "text-brand-red bg-brand-red/10"
      : "text-brand-black bg-brand-gray";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-black/5 bg-white p-4">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
          {label}
        </p>
        <p className="font-display text-xl text-brand-black">{value}</p>
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
        "rounded-full border px-4 py-2 text-xs font-medium transition",
        active
          ? "border-brand-red bg-brand-red text-white"
          : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-red/30"
      )}
    >
      {children}
    </button>
  );
}