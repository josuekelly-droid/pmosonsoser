import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = constructMetadata({
  title: "Mentions Légales",
  pathname: "/mentions-legales",
});

export default async function MentionsLegalesPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  
  const email = settings?.email || "contact@pmosonsoser.com";
  const phone = settings?.phone || "+229 XX XX XX XX";
  const address = settings?.address || "Cotonou, Bénin";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          
          {/* En-tête de section */}
          <div className="mb-10 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
              [ Transparence ]
            </span>
            <h1 className="mt-3 font-display text-4xl font-light tracking-wide text-white sm:text-5xl">
              Mentions <span className="italic font-serif text-brand-red">Légales</span>
            </h1>
          </div>
          
          {/* Conteneur principal Glassmorphism */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-12 space-y-8">
            
            <div>
              <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                1. Éditeur du site
              </h2>
              <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed space-y-1">
                Le site <strong className="text-white">pmosonsoser.com</strong> est édité par PM Osons Oser.<br />
                <strong className="text-white">Responsable de la publication :</strong> Parfait Senan AGBLONON<br />
                <strong className="text-white">Adresse :</strong> {address}<br />
                <strong className="text-white">Téléphone :</strong> {phone}<br />
                <strong className="text-white">Email :</strong> {email}
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                2. Hébergement
              </h2>
              <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed">
                Le site est hébergé par Vercel Inc.<br />
                340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
                Site web : <span className="text-white underline">vercel.com</span>
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                3. Propriété intellectuelle
              </h2>
              <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed">
                L'ensemble du contenu présent sur ce site (textes, images, logos, vidéos, éléments graphiques) est la propriété exclusive de PM Osons Oser, sauf mention contraire explicite. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, sans autorisation écrite préalable est strictement interdite.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                4. Protection des données personnelles
              </h2>
              <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed">
                Les informations collectées sur ce site (nom, email, téléphone, adresse) sont uniquement destinées au traitement des commandes, à la gestion logistique et à la relation client. Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, contactez-nous directement à <strong className="text-white">{email}</strong>.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-light text-white mb-3 tracking-wide">
                5. Cookies
              </h2>
              <p className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed">
                Le site utilise des cookies techniques strictement nécessaires à son bon fonctionnement (gestion du panier, authentification et session utilisateur). En naviguant sur notre plateforme, vous acceptez l'utilisation de ces traceurs essentiels.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}