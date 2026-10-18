import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-black px-4 py-16">
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-red/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-3 transition hover:opacity-90"
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-red/40">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM Osons Oser"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center">
            <p className="font-display text-2xl leading-none tracking-wide text-white">
              PM <span className="text-brand-red">OSONS OSER</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">
              Motos · Pièces · Lubrifiants
            </p>
          </div>
        </Link>

        {children}

        <p className="mt-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} PM Osons Oser — Tous droits réservés
        </p>
      </div>
    </div>
  );
}