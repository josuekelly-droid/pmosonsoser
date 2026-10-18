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
  B2C: { label: "Particulier", class: "bg-gray-100 text-gray-700", icon: User },
  B2B: { label: "Pro", class: "bg-blue-100 text-blue-700", icon: Store },
  PREMIUM: { label: "Premium", class: "bg-purple-100 text-purple-700", icon: Crown },
};

const STATUT_BADGES: Record<string, { label: string; class: string; icon: any }> = {
  EN_ATTENTE: { label: "En attente", class: "bg-amber-100 text-amber-700", icon: Clock },
  VALIDE: { label: "Validé", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
  REJETE: { label: "Rejeté", class: "bg-red-100 text-red-700", icon: XCircle },
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
        alert(data.error || "Erreur");
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
        alert(data.error || "Erreur");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone…"
            className="h-11 w-full rounded-full border border-brand-black/10 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-red"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 rounded-full border border-brand-black/10 bg-white px-4 text-sm outline-none focus:border-brand-red"
        >
          <option value="">Tous les types</option>
          <option value="B2C">Particulier</option>
          <option value="B2B">Professionnel</option>
          <option value="PREMIUM">Premium</option>
        </select>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="h-11 rounded-full border border-brand-black/10 bg-white px-4 text-sm outline-none focus:border-brand-red"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validé</option>
          <option value="REJETE">Rejeté</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-black/5 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <User className="h-12 w-12 text-brand-black/20" />
            <p className="mt-3 text-sm text-brand-black/50">
              Aucun utilisateur ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-brand-black/5 bg-brand-gray/40">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Commandes
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-b border-brand-black/5 last:border-0 transition hover:bg-brand-gray/20"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                              isAdmin ? "bg-brand-red" : "bg-brand-black"
                            )}
                          >
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-brand-black">
                              {u.name || "—"}
                              {isAdmin && (
                                <Shield className="h-3.5 w-3.5 text-brand-red" />
                              )}
                            </p>
                            <p className="truncate text-[11px] text-brand-black/50">
                              {u.email}
                            </p>
                            {u.phone && (
                              <p className="text-[11px] text-brand-black/50">
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            typeBadge.class
                          )}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            statutBadge.class
                          )}
                        >
                          <StatutIcon className="h-3 w-3" />
                          {statutBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-display text-base text-brand-black">
                          {u._count.orders}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
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
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50"
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
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Toggle admin */}
                          {!isLoading && (
                            <button
                              onClick={() =>
                                updateUser(u.id, {
                                  role: isAdmin ? "CLIENT" : "ADMIN",
                                })
                              }
                              title={
                                isAdmin
                                  ? "Retirer le rôle admin"
                                  : "Promouvoir admin"
                              }
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition",
                                isAdmin
                                  ? "text-brand-red hover:bg-red-50"
                                  : "text-brand-black/40 hover:bg-brand-red/10 hover:text-brand-red"
                              )}
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          )}

                          {/* Supprimer */}
                          {!isLoading && (
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              title="Supprimer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-black/40 transition hover:bg-red-50 hover:text-red-600"
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