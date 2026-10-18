import Link from "next/link";
import Image from "next/image";
import { Home, SearchX, ArrowRight } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-black px-4 py-20 text-center">
      {/* --- FONDS DÉCORATIFS --- */}
      {/* Grille subtile */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Halo rouge */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-[120px]" />

      {/* --- CONTENU --- */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 transition hover:opacity-80">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-brand-red/40">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM Osons Oser"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <span className="font-display text-2xl tracking-wide text-white">
            PM <span className="text-brand-red">OSONS OSER</span>
          </span>
        </Link>

        {/* Icône */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-red/10 ring-1 ring-brand-red/20">
          <SearchX className="h-12 w-12 text-brand-red" />
        </div>

        {/* Code 404 */}
        <h1 className="mt-8 font-display text-7xl tracking-wider text-white md:text-9xl">
          4<span className="text-brand-red">0</span>4
        </h1>

        <h2 className="mt-2 font-display text-2xl tracking-wide text-white md:text-3xl">
          Page introuvable
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
          Désolé, la page que vous recherchez n'existe pas, a été déplacée, ou vous
          n'avez pas les droits pour y accéder.
        </p>

        {/* Boutons d'action */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-red px-7 text-sm font-semibold uppercase tracking-wider text-white shadow-xl shadow-brand-red/20 transition hover:bg-brand-red/90"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <Link
            href="/motos"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            Voir le catalogue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Footer minimaliste */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} PM Osons Oser — Tous droits réservés
        </p>
      </div>
    </div>
  );
}