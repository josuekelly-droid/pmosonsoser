import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 pt-32 text-center">
      <PackageX className="h-16 w-16 text-brand-red/40" />
      <h1 className="mt-6 font-display text-4xl tracking-wide text-brand-black md:text-5xl">
        Produit introuvable
      </h1>
      <p className="mt-3 max-w-md text-sm text-brand-black/60">
        Ce produit n'existe pas ou n'est plus disponible. Parcourez notre catalogue
        pour découvrir d'autres articles.
      </p>
      <Link
        href="/motos"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90"
      >
        Voir le catalogue
      </Link>
    </div>
  );
}