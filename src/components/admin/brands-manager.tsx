"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Check,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Brand = {
  id: string;
  name: string;
  logo: string | null;
  _count: { products: number };
};

export function BrandsManager({ initialBrands }: { initialBrands: Brand[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Édition
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Suppression
  const [deleting, setDeleting] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  async function createBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }

      setBrands([...brands, { ...data.brand, _count: { products: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      router.refresh();
    } catch {
      setError("Connexion impossible");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(brand: Brand) {
    setEditingId(brand.id);
    setEditName(brand.name);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        setBrands(
          brands.map((b) => (b.id === id ? { ...b, name: data.brand.name } : b)).sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        router.refresh();
      }
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/brands/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Erreur");
        return;
      }

      setBrands(brands.filter((b) => b.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    } catch {
      setDeleteError("Connexion impossible");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulaire de création */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
        <h2 className="font-display text-xl font-light tracking-wide text-white">
          Ajouter une nouvelle marque
        </h2>
        <form onSubmit={createBrand} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Bajaj, Yamaha, Suzuki…"
            className="h-12 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-brand-red focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-red px-6 text-sm font-semibold text-white transition hover:bg-brand-red/90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ajouter
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une marque…"
          className="h-12 w-full rounded-full border border-white/10 bg-neutral-900/40 pl-11 pr-4 text-sm text-white backdrop-blur-md placeholder:text-neutral-500 focus:border-brand-red focus:outline-none"
        />
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-neutral-400">Aucune marque trouvée.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((brand) => (
              <li key={brand.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03]">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10 font-display text-sm font-bold text-brand-red">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>

                  {editingId === brand.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(brand.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-9 flex-1 rounded-lg border border-brand-red bg-black/40 px-3 text-sm text-white focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit(brand.id)}
                        disabled={savingEdit}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{brand.name}</p>
                      <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Package className="h-3 w-3" />
                        {brand._count.products} produit{brand._count.products > 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== brand.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => startEdit(brand)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setDeleting(brand); setDeleteError(null); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modale Suppression */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-light text-white">
              Supprimer la marque ?
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Voulez-vous vraiment supprimer <strong className="text-white">{deleting.name}</strong> ?
            </p>
            {deleting._count.products > 0 && (
              <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                ⚠️ Cette marque est liée à {deleting._count.products} produit(s). Supprimez d'abord ces produits.
              </p>
            )}
            {deleteError && (
              <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting || deleting._count.products > 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}