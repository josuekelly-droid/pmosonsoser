"use client";

import Link from "next/link";
import { WifiOff, Home, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6 text-white selection:bg-brand-red selection:text-white">
      {/* Halo lumineux d'arrière-plan */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-brand-red/10 blur-[120px]" />

      <div className="relative z-10 max-w-md text-center">
        {/* Icône alerte */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-2xl">
          <WifiOff className="h-8 w-8" />
        </div>

        <span className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          [ Connexion interrompue ]
        </span>

        <h1 className="mt-2 font-display text-3xl font-light tracking-wide md:text-4xl">
          Vous êtes hors-ligne
        </h1>

        <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-400">
          Impossible d'établir une connexion avec les serveurs de PM Osons Oser. Vérifiez votre réseau mobile ou votre connexion Wi-Fi.
        </p>

        {/* Boutons d'action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-brand-red/50 bg-brand-red px-6 py-3 font-mono text-xs uppercase tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:bg-brand-red/90"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>

          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-neutral-300 backdrop-blur-md transition-all hover:border-white/20 hover:text-white"
          >
            <Home className="h-4 w-4 text-neutral-400" />
            <span>Accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}