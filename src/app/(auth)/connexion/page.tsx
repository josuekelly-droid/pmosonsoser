import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = constructMetadata({
  title: "Connexion",
  description: "Connectez-vous à votre espace sécurisé PM Osons Oser.",
  pathname: "/connexion",
});

export default function ConnexionPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] flex flex-col justify-between py-12 px-6">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-brand-red/10 blur-[140px] pointer-events-none" />

      {/* En-tête minimaliste avec Logo */}
      <div className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20 p-0.5 transition-transform duration-500 group-hover:scale-105">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM Osons Oser"
              fill
              sizes="40px"
              className="rounded-full object-cover"
            />
          </div>
          <span className="font-display text-lg font-light tracking-wide text-white">
            PM <span className="italic font-serif text-brand-red">Osons Oser</span>
          </span>
        </Link>

        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          [ Session sécurisée ]
        </span>
      </div>

      {/* Conteneur principal du formulaire */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-md py-8">
        <Suspense
          fallback={
            <div className="h-[480px] w-full rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Pied de page discret */}
      <footer className="relative z-10 mx-auto w-full max-w-md text-center">
        <p className="font-mono text-[11px] text-neutral-600">
          &copy; {new Date().getFullYear()} PM Osons Oser. Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}