import Link from "next/link";
import { PackageX, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white flex flex-col items-center justify-center">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-md px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <PackageX className="h-10 w-10" />
        </div>

        <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
          [ Erreur 404 ]
        </span>
        <h1 className="mt-1 font-display text-4xl font-light tracking-wide text-white md:text-5xl">
          Page ou produit <span className="italic font-serif text-brand-red">introuvable</span>
        </h1>
        <p className="mt-3 font-mono text-xs md:text-sm text-neutral-400 leading-relaxed">
          Cette ressource n'existe pas ou n'est plus disponible sur notre plateforme. Parcourez notre catalogue pour découvrir nos sélections.
        </p>

        <div className="mt-8">
          <Link
            href="/motos"
            className="group inline-flex items-center justify-center gap-3 rounded-full border border-brand-red/30 bg-brand-red px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/30 transition-all duration-300 hover:bg-white hover:text-black"
          >
            <span>Voir le catalogue</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </div>
  );
}