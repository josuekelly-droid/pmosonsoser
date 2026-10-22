"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Save,
} from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type ProductData = {
  id?: string;
  name: string;
  description: string;
  priceB2C: number;
  priceB2B: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  brandId: string;
};

export function ProductForm({
  mode,
  categories,
  brands,
  initial,
}: {
  mode: "create" | "edit";
  categories: Category[];
  brands: Brand[];
  initial?: ProductData;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initial?.images || []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const priceB2B = formData.get("priceB2B");

    const payload = {
      name: formData.get("name"),
      description: formData.get("description") || "",
      priceB2C: Number(formData.get("priceB2C")),
      priceB2B: priceB2B ? Number(priceB2B) : null,
      stock: Number(formData.get("stock")),
      images,
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId"),
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const firstError =
          data.details &&
          Object.values(data.details as Record<string, string[]>)[0]?.[0];
        setError(firstError || data.error || "Erreur lors de l'enregistrement");
        return;
      }

      router.push("/admin/produits");
      router.refresh();
    } catch {
      setError("Connexion impossible au serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Retour */}
      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
      >
        <ArrowUpRight className="h-4 w-4 rotate-[225deg]" />
        <span>Retour à la liste des produits</span>
      </Link>

      {/* Informations */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Configuration ]
        </span>
        <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
          Informations générales
        </h2>

        <div className="mt-6 space-y-5">
          <Field label="Nom du produit *">
            <input
              name="name"
              required
              minLength={2}
              maxLength={200}
              defaultValue={initial?.name}
              placeholder="Ex: Apsonic AP110-2"
              className="input"
            />
          </Field>

          <Field label="Description technique">
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={initial?.description}
              placeholder="Description détaillée du produit…"
              className="input resize-none py-3"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Catégorie *">
              <select
                name="categoryId"
                required
                defaultValue={initial?.categoryId}
                className="input cursor-pointer"
              >
                <option value="" className="bg-neutral-900 text-neutral-400">
                  Sélectionner une catégorie…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            
            <Field label="Marque *">
              <select
                name="brandId"
                required
                defaultValue={initial?.brandId}
                className="input cursor-pointer"
              >
                <option value="" className="bg-neutral-900 text-neutral-400">
                  Sélectionner une marque…
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Prix et stock */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Économie & Logistique ]
        </span>
        <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
          Prix & stock
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Prix public B2C (XOF) *">
            <input
              name="priceB2C"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={initial?.priceB2C}
              placeholder="650000"
              className="input"
            />
          </Field>
          <Field label="Prix pro B2B (XOF)">
            <input
              name="priceB2B"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.priceB2B ?? ""}
              placeholder="Optionnel"
              className="input"
            />
          </Field>
          <Field label="Stock disponible *">
            <input
              name="stock"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={initial?.stock ?? 0}
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Images */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Médias ]
        </span>
        <h2 className="mt-1 font-display text-2xl font-light tracking-wide text-white">
          Images du produit
        </h2>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Ajoutez une URL ou uploadez directement vos photos (maximum 10). La première image servira de visuel principal.
        </p>

        <div className="mt-6">
          {/* ⬇️ LE NOUVEAU COMPOSANT EST ICI ⬇️ */}
          <ImageUploader images={images} onChangeAction={setImages} />
        </div>
      </section>

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 font-mono text-xs text-red-400 backdrop-blur-md">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Link
          href="/admin/produits"
          className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-neutral-900/40 px-8 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-2xl transition-all hover:bg-neutral-900/60"
        >
          <span>Annuler</span>
        </Link>
        
        <button
          type="submit"
          disabled={loading}
          className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-brand-red/30 bg-brand-red px-9 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all hover:bg-white hover:text-black disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{mode === "create" ? "Création en cours…" : "Enregistrement…"}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{mode === "create" ? "Créer le produit" : "Enregistrer les modifications"}</span>
            </>
          )}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 3.25rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.4);
          padding: 0 1.25rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.875rem;
          color: #ffffff;
          outline: none;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #ef4444;
        }
        textarea.input {
          height: auto;
          padding: 1rem 1.25rem;
        }
        select.input option {
          background-color: #0a0a0b;
          color: #ffffff;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  );
}