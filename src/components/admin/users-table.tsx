"use client";

import { useState, useMemo } from "react";
import { Search, User, Shield, Store, Crown, Trash2, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  typeCompte: "B2C" | "B2B" | "PREMIUM";
  statutValidation: "EN_ATTENTE" | "VALIDE" | "REJETE";
  emailVerified: Date | null;
  createdAt: Date;
  _count: { orders: number };
};

const TYPE_BADGES: Record<string, { label: string; class: string; icon: any }> = {
  B2C: { label: "Particulier", class: "border-white/10 bg-white/5 text-neutral-300", icon: User },
  B2B: { label: "Pro", class: "border-blue-500/30 bg-blue-500/10 text-blue-400", icon: Store },
  PREMIUM: { label: "Premium", class: "border-purple-500/30 bg-purple-500/10 text-purple-400", icon: Crown },
};

const STATUT_BADGES: Record<string, { label: string; class: string; icon: any }> = {
  EN_ATTENTE: { label: "En attente", class: "border-amber-500/30 bg-amber-500/10 text-amber-400", icon: Clock },
  VALIDE: { label: "Validé", class: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  REJETE: { label: "Rejeté", class: "border-red-500/30 bg-red-500/10 text-red-400", icon: XCircle },
};

export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const mSearch =
        !search ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone?.includes(q) ?? false);
      const mType = !typeFilter || u.typeCompte === typeFilter;
      const mStatut = !statutFilter || u.statutValidation === statutFilter;
      return mSearch && mType && mStatut;
    });
  }, [users, search, typeFilter, statutFilter]);

  async function updateUser(
    id: string,
    updates: Partial<Pick<UserRow, "role" | "statutValidation" | "typeCompte">>
  ) {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
        );
      } else {
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(id: string, name: string | null) {
    if (!confirm(`Supprimer définitivement ${name || "cet utilisateur"} ?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* FILTRES & RECHERCHE HUD */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone…"
            className="h-12 w-full rounded-full border border-white/10 bg-neutral-900/40 pl-12 pr-5 font-mono text-xs md:text-sm text-white placeholder-neutral-500 outline-none backdrop-blur-md transition-colors focus:border-brand-red"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-12 rounded-full border border-white/10 bg-neutral-900/40 px-5 font-mono text-xs uppercase tracking-wider text-white outline-none backdrop-blur-md transition-colors focus:border-brand-red cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-neutral-400">Tous les types</option>
          <option value="B2C" className="bg-neutral-900 text-white">Particulier</option>
          <option value="B2B" className="bg-neutral-900 text-white">Professionnel</option>
          <option value="PREMIUM" className="bg-neutral-900 text-white">Premium</option>
        </select>
        
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="h-12 rounded-full border border-white/10 bg-neutral-900/40 px-5 font-mono text-xs uppercase tracking-wider text-white outline-none backdrop-blur-md transition-colors focus:border-brand-red cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-neutral-400">Tous les statuts</option>
          <option value="EN_ATTENTE" className="bg-neutral-900 text-amber-400">En attente</option>
          <option value="VALIDE" className="bg-neutral-900 text-emerald-400">Validé</option>
          <option value="REJETE" className="bg-neutral-900 text-red-400">Rejeté</option>
        </select>
      </div>

      {/* TABLEAU GLASSMORPHISM */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
              <User className="h-8 w-8" />
            </div>
            <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400">
              Aucun utilisateur ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Type de compte
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Commandes
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => {
                  const typeBadge = TYPE_BADGES[u.typeCompte];
                  const statutBadge = STATUT_BADGES[u.statutValidation];
                  const TypeIcon = typeBadge.icon;
                  const StatutIcon = statutBadge.icon;
                  const isLoading = loading === u.id;
                  const isAdmin = u.role === "ADMIN";
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-display text-sm font-light text-white shadow-md",
                              isAdmin
                                ? "border-brand-red/30 bg-brand-red/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                : "border-white/10 bg-black/40"
                            )}
                          >
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-sans text-sm font-medium text-white">
                              <span>{u.name || "—"}</span>
                              {isAdmin && (
                                <Shield className="h-3.5 w-3.5 text-brand-red" />
                              )}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-neutral-400 truncate">
                              {u.email}
                            </p>
                            {u.phone && (
                              <p className="font-mono text-[11px] text-neutral-500">
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md",
                            typeBadge.class
                          )}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          <span>{typeBadge.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md",
                            statutBadge.class
                          )}
                        >
                          <StatutIcon className="h-3.5 w-3.5" />
                          <span>{statutBadge.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-display text-lg font-light tracking-wide text-white">
                          {u._count.orders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
                          )}

                          {/* Validation B2B */}
                          {u.typeCompte === "B2B" && !isLoading && (
                            <>
                              {u.statutValidation !== "VALIDE" && (
                                <button
                                  onClick={() =>
                                    updateUser(u.id, {
                                      statutValidation: "VALIDE",
                                    })
                                  }
                                  title="Valider le compte pro"
                                  aria-label="Valider le compte pro"
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-md transition-all hover:bg-emerald-600 hover:text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              {u.statutValidation !== "REJETE" && (
                                <button
                                  onClick={() =>
                                    updateUser(u.id, {
                                      statutValidation: "REJETE",
                                    })
                                  }
                                  title="Rejeter la demande"
                                  aria-label="Rejeter la demande"
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 backdrop-blur-md transition-all hover:bg-amber-600 hover:text-white"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Toggle Admin */}
                          {!isLoading && (
                            <button
                              onClick={() =>
                                updateUser(u.id, {
                                  role: isAdmin ? "CLIENT" : "ADMIN",
                                })
                              }
                              title={isAdmin ? "Retirer le rôle admin" : "Promouvoir admin"}
                              aria-label={isAdmin ? "Retirer le rôle admin" : "Promouvoir admin"}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md transition-all",
                                isAdmin
                                  ? "border-brand-red/30 bg-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white"
                                  : "border-white/10 bg-white/5 text-neutral-400 hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-white"
                              )}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          )}

                          {/* Supprimer */}
                          {!isLoading && (
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              title="Supprimer l'utilisateur"
                              aria-label="Supprimer l'utilisateur"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 backdrop-blur-md transition-all hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}