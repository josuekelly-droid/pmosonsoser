import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
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

  const settings = await prisma.settings.findUnique({
    where: { id: "global" },
  });

  const phone = settings?.phone || "+229 XX XX XX XX";
  const email = settings?.email || "contact@pmosonsoser.com";
  const address = settings?.address || "Cotonou, Bénin";
  const facebook = settings?.facebook || "https://facebook.com";
  const instagram = settings?.instagram || "https://instagram.com";

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-brand-black text-white/70">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[120px]" />

      {/* Section Newsletter */}
      <div className="relative border-b border-white/10">
        {/* py-16 ajoute beaucoup d'espace en haut et en bas de la section */}
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          {/* gap-10 sur mobile pour bien séparer le texte du formulaire */}
          <div className="grid items-start gap-10 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <h3 className="font-display text-3xl tracking-wide text-white md:text-4xl">
                Restez <span className="text-brand-red">informé</span>
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
                Recevez en avant-première nos nouveaux modèles, promotions exclusives et
                arrivages de pièces détachées.
              </p>
            </div>
            <div className="w-full">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* Section Principale */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-brand-red/40">
                <Image
                  src="/logo/pm-osons-oser-1.jpg"
                  alt="PM Osons Oser"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-display text-2xl leading-none tracking-wide text-white">
                  PM <span className="text-brand-red">OSONS OSER</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Motos · Pièces · Lubrifiants
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed">
              Votre partenaire de confiance pour la vente de motos, tricycles, pièces
              détachées et lubrifiants au Bénin. Qualité, fiabilité et service premium.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-brand-red hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-brand-red hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="font-display text-lg tracking-wider text-white">Boutique</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LINKS.boutique.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-brand-red">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="font-display text-lg tracking-wider text-white">Entreprise</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LINKS.entreprise.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-brand-red">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg tracking-wider text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <span>{phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <a href={`mailto:${email}`} className="hover:text-brand-red transition">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <span>{address}</span>
              </li>
            </ul>
            
            <div className="mt-6 border-t border-white/10 pt-4">
               <ul className="space-y-2 text-sm">
                {LINKS.compte.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-brand-red">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/50">
            © {year} {siteConfig.name}. Tous droits réservés.
          </p>
          <p className="text-xs text-white/50">
            Conçu & développé par{" "}
            <span className="font-medium text-white">Kelly Josué AKPLOGAN</span>
          </p>
        </div>
      </div>
    </footer>
  );
}