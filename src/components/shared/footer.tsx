import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { NewsletterForm } from "./newsletter-form";

const LINKS = {
  boutique: [
    { href: "/motos", label: "Motos" },
    { href: "/tricycles", label: "Tricycles" },
    { href: "/pieces-detachees", label: "Pièces Détachées" },
    { href: "/lubrifiants", label: "Lubrifiants" },
  ],
  entreprise: [
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/livraison", label: "Livraison" },
    { href: "/cgv", label: "CGV" },
    { href: "/mentions-legales", label: "Mentions Légales" },
  ],
  compte: [
    { href: "/connexion", label: "Connexion" },
    { href: "/inscription", label: "Créer un compte" },
    { href: "/pro", label: "Espace Pro (B2B)" },
  ],
};

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function Footer() {
  const year = new Date().getFullYear();

  let settings = null;
  try {
    settings = await prisma.settings.findUnique({
      where: { id: "global" },
    });
  } catch (error) {
    console.warn("⚠️ [Footer] DB indisponible, utilisation des valeurs par défaut.");
  }

  const phone = settings?.phone || "+229 XX XX XX XX";
  const email = settings?.email || "contact@pmosonsoser.com";
  const address = settings?.address || "Cotonou, Bénin";
  const facebook = settings?.facebook || "https://facebook.com";
  const instagram = settings?.instagram || "https://instagram.com";

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#0A0A0B] text-neutral-400 selection:bg-brand-red selection:text-white">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[160px]" />

      {/* SECTION NEWSLETTER HIGH-END */}
      <div className="relative border-b border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-xl md:p-14">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
                  [ Restez Connecté ]
                </span>
                <h3 className="mt-3 font-display text-3xl font-light tracking-tight text-white md:text-5xl">
                  Rejoignez le <span className="italic font-serif font-normal text-brand-red">Club PM</span>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-neutral-400 md:text-base">
                  Soyez informé en priorité des nouveaux arrivages, modèles exclusifs et opportunités B2B.
                </p>
              </div>
              <div className="w-full lg:col-span-6">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION PRINCIPALE */}
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/15 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo/pm-osons-oser-1.jpg"
                  alt="PM Osons Oser"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-display text-2xl font-light tracking-wide text-white">
                  PM <span className="font-bold text-brand-red">OSONS OSER</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Mobilité & Performance Bénin
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">
              Leader certifié dans l'importation et la distribution de véhicules à deux et trois roues, pièces détachées d'origine et lubrifiants au Bénin.
            </p>

            {/* Réseaux Sociaux */}
            <div className="mt-8 flex gap-3">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300 transition-all duration-300 hover:border-brand-red hover:bg-brand-red hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300 transition-all duration-300 hover:border-brand-red hover:bg-brand-red hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* BOUTIQUE */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Catalogue</h4>
            <ul className="mt-6 space-y-3 font-sans text-sm">
              {LINKS.boutique.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand-red opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ENTREPRISE */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Société</h4>
            <ul className="mt-6 space-y-3 font-sans text-sm">
              {LINKS.entreprise.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand-red opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT & PRO */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Contact Direct</h4>
            <ul className="mt-6 space-y-4 font-sans text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-brand-red" />
                <span className="text-neutral-300">{phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-brand-red" />
                <a href={`mailto:${email}`} className="text-neutral-300 transition-colors hover:text-white">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-red" />
                <span className="text-neutral-300">{address}</span>
              </li>
            </ul>

            <div className="mt-8 border-t border-white/10 pt-6">
              <ul className="space-y-2.5 font-mono text-xs">
                {LINKS.compte.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-2 text-neutral-400 transition-colors duration-300 hover:text-brand-red"
                    >
                      <span>{l.label}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* MARQUEUR TYPOGRAPHIQUE FOOTER (SIGNATURE AWWWARDS) */}
        <div className="mt-20 border-t border-white/10 pt-10 text-center">
          <p className="select-none font-display text-[11vw] font-extrabold uppercase leading-none tracking-tighter text-white/[0.03]">
            PM OSONS OSER
          </p>
        </div>

        {/* BOTTOM COPYRIGHT & AUTHOR CREDITS */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 font-mono text-xs text-neutral-500 md:flex-row">
          <p>© {year} {siteConfig.name}. Tous droits réservés.</p>
          <p className="text-center md:text-right">
            Conçu & développé par{" "}
            <a
              href="https://kja-studio-labs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-300 transition-colors duration-300 hover:text-brand-red hover:underline"
            >
              Kelly Josué AKPLOGAN (KJA Studio Labs)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}