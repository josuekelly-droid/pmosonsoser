"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  Plus,
  X,
  Image as ImageIcon,
  ArrowLeft,
  Save,
} from "lucide-react";
import Image from "next/image";

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
  const [imageInput, setImageInput] = useState("");

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      setError("L'URL de l'image doit commencer par http:// ou https://");
      return;
    }
    if (images.length >= 10) {
      setError("Maximum 10 images par produit.");
      return;
    }
    setImages([...images, url]);
    setImageInput("");
    setError(null);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

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
        setError(firstError || data.error || "Erreur");
        return;
      }

      router.push("/admin/produits");
      router.refresh();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Retour */}
      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-black/60 transition hover:text-brand-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      {/* Informations */}
      <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-wide text-brand-black">
          Informations générales
        </h2>

        <div className="mt-6 space-y-4">
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

          <Field label="Description">
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={initial?.description}
              placeholder="Description détaillée du produit…"
              className="input resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Catégorie *">
              <select
                name="categoryId"
                required
                defaultValue={initial?.categoryId}
                className="input"
              >
                <option value="">Sélectionner…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
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
                className="input"
              >
                <option value="">Sélectionner…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Prix et stock */}
      <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-wide text-brand-black">
          Prix & stock
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Prix public (B2C) *">
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
          <Field label="Prix pro (B2B)">
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
      <section className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-wide text-brand-black">
          Images du produit
        </h2>
        <p className="mt-1 text-xs text-brand-black/50">
          Collez les URLs des images (max 10). Le premier sera l'image principale.
        </p>

        {/* Ajout */}
        <div className="mt-5 flex gap-2">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://exemple.com/image.jpg"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addImage}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-black px-5 text-sm font-medium text-white transition hover:bg-brand-red"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        {/* Aperçu */}
        {images.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-black/10 py-10 text-center">
            <ImageIcon className="h-10 w-10 text-brand-black/20" />
            <p className="mt-2 text-xs text-brand-black/50">
              Aucune image. Ajoutez au moins une URL.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((url, i) => (
              <div
                key={url + i}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-brand-black/5 bg-brand-gray"
              >
                <Image
                  src={url}
                  alt={`Image ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-white">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Supprimer"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-black opacity-0 transition hover:bg-red-600 hover:text-white group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Boutons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/produits"
          className="inline-flex h-12 items-center justify-center rounded-full border border-brand-black/10 bg-white px-6 text-sm font-medium text-brand-black transition hover:bg-brand-gray"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-red px-7 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "create" ? "Création…" : "Enregistrement…"}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Créer le produit" : "Enregistrer"}
            </>
          )}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 3rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(26, 26, 26, 0.1);
          background: #fff;
          padding: 0 1rem;
          font-size: 0.875rem;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #e30613;
        }
        textarea.input {
          height: auto;
          padding: 0.75rem 1rem;
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
      <label className="mb-2 block text-sm font-medium text-brand-black">
        {label}
      </label>
      {children}
    </div>
  );
}