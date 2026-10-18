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
    <section className="bg-brand-gray py-20 pt-32">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h1 className="font-display text-4xl tracking-wide text-brand-black mb-8">Mentions Légales</h1>
        
        <div className="prose prose-gray max-w-none space-y-8 rounded-3xl border border-brand-black/5 bg-white p-8 md:p-12 shadow-sm">
          
          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-black mb-3">1. Éditeur du site</h2>
            <p className="text-brand-black/70 text-sm leading-relaxed">
              Le site <strong>pmosonsoser.com</strong> est édité par PM Osons Oser.<br />
              <strong>Responsable de la publication :</strong> Parfait Senan AGBLONON<br />
              <strong>Adresse :</strong> {address}<br />
              <strong>Téléphone :</strong> {phone}<br />
              <strong>Email :</strong> {email}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-black mb-3">2. Hébergement</h2>
            <p className="text-brand-black/70 text-sm leading-relaxed">
              Le site est hébergé par Vercel Inc.<br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
              Site web : vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-black mb-3">3. Propriété intellectuelle</h2>
            <p className="text-brand-black/70 text-sm leading-relaxed">
              L'ensemble du contenu du site (textes, images, logos, vidéos) est la propriété exclusive de PM Osons Oser, sauf mention contraire. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, sans autorisation écrite préalable est strictement interdite.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-black mb-3">4. Protection des données personnelles</h2>
            <p className="text-brand-black/70 text-sm leading-relaxed">
              Les informations collectées sur ce site (nom, email, téléphone, adresse) sont uniquement destinées au traitement des commandes et à la relation client. Conformément aux réglementations en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à {email}.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-display tracking-wide text-brand-black mb-3">5. Cookies</h2>
            <p className="text-brand-black/70 text-sm leading-relaxed">
              Le site utilise des cookies techniques nécessaires à son bon fonctionnement (panier, session utilisateur). En naviguant sur le site, vous acceptez l'utilisation de ces cookies.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}