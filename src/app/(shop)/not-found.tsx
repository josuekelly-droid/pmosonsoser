import Link from "next/link";
import { Home, Compass, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0A0A0B] px-4 text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[180px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_25px_rgba(239,68,68,0.25)]">
          <Compass className="h-12 w-12 animate-pulse" />
        </div>

        <span className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
          [ Erreur 404 ]
        </span>
        <h1 className="mt-2 font-display text-7xl font-light tracking-wide text-white md:text-9xl">
          4<span className="text-brand-red">0</span>4
        </h1>
        <h2 className="mt-2 font-display text-2xl font-light tracking-wide text-white/90">
          Page introuvable
        </h2>
        <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400 leading-relaxed">
          Désolé, la page que vous recherchez n'existe pas, a été déplacée ou n'est plus accessible sur notre plateforme.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-3 rounded-full border border-brand-red/30 bg-brand-red px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black"
          >
            <Home className="h-4 w-4" />
            <span>Retour à l'accueil</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </div>
  );
}