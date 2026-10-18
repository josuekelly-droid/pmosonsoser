import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0B] px-4 py-16">
      {/* Halos décoratifs Dark Luxury haute intensité */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-red/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO & EN-TÊTE DE MARQUE */}
        <Link
          href="/"
          className="group mb-8 flex flex-col items-center gap-3 transition-transform duration-500 hover:scale-[1.02]"
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/20 p-0.5 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM Osons Oser"
              fill
              sizes="64px"
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-light tracking-wide text-white">
              PM <span className="italic font-serif text-brand-red">Osons Oser</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Motos · Pièces · Lubrifiants
            </p>
          </div>
        </Link>

        {/* CONTENU ENFANT (FORMULAIRES D'AUTHENTIFICATION) */}
        {children}

        {/* PIED DE PAGE DISCRET */}
        <p className="mt-8 text-center font-mono text-[11px] text-neutral-600">
          &copy; {new Date().getFullYear()} PM Osons Oser — Tous droits réservés
        </p>
      </div>
    </div>
  );
}