import Link from "next/link";
import Image from "next/image";
import { Home, SearchX, ArrowUpRight } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0B] px-4 py-20 text-white">
      {/* --- FONDS DÉCORATIFS DARK LUXURY --- */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-[160px]" />

      {/* --- CONTENU --- */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM Osons Oser"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <span className="font-display text-2xl tracking-wide text-white">
            PM <span className="text-brand-red font-serif italic">OSONS OSER</span>
          </span>
        </Link>

        {/* Icône en verre dépoli */}
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-2xl">
          <SearchX className="h-10 w-10 animate-pulse" />
        </div>

        {/* Code 404 */}
        <span className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
          [ Erreur Système 404 ]
        </span>
        <h1 className="mt-1 font-display text-7xl font-light tracking-wider text-white md:text-9xl">
          4<span className="text-brand-red">0</span>4
        </h1>

        <h2 className="mt-2 font-display text-2xl font-light tracking-wide text-white md:text-3xl">
          Page introuvable
        </h2>

        <p className="mx-auto mt-4 max-w-md font-mono text-xs md:text-sm leading-relaxed text-neutral-400">
          Désolé, la ressource que vous recherchez n'existe pas, a été déplacée ou nécessite des accréditations spécifiques.
        </p>

        {/* Boutons d'action HUD */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-brand-red/30 bg-brand-red px-8 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black"
          >
            <Home className="h-4 w-4" />
            <span>Retour à l'accueil</span>
          </Link>
          
          <Link
            href="/motos"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-neutral-900/40 px-8 font-mono text-xs font-bold uppercase tracking-widest text-white backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60"
          >
            <span>Voir le catalogue</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>

      {/* Footer minimaliste */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-[11px] text-neutral-500 tracking-widest">
          © {new Date().getFullYear()} PM OSONS OSER — TOUS DROITS RÉSERVÉS
        </p>
      </div>
    </div>
  );
}