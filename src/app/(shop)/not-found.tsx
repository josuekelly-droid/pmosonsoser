import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4 pt-32 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-red/10">
        <Compass className="h-12 w-12 text-brand-red" />
      </div>
      <h1 className="mt-8 font-display text-6xl tracking-wide text-brand-black md:text-8xl">
        404
      </h1>
      <h2 className="mt-2 font-display text-2xl tracking-wide text-brand-black/80">
        Page introuvable
      </h2>
      <p className="mt-4 max-w-md text-sm text-brand-black/60">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand-red px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90"
      >
        <Home className="h-4 w-4" />
        Retour à l'accueil
      </Link>
    </div>
  );
}