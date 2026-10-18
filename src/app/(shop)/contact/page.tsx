import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { constructMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/shared/contact-form";

export const metadata: Metadata = constructMetadata({
  title: "Contactez-nous",
  pathname: "/contact",
});

export default async function ContactPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  
  return (
    <section className="bg-brand-gray py-20 pt-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Infos */}
          <div>
            <h1 className="font-display text-4xl tracking-wide text-brand-black mb-6">Parlons de votre projet</h1>
            <p className="text-brand-black/60 mb-8">Une question sur une moto, un besoin de pièce spécifique ou une demande de partenariat ? Écrivez-nous.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-red shadow-sm"><Phone /></div>
                <div>
                  <p className="text-xs font-semibold uppercase text-brand-black/50">Téléphone</p>
                  <p className="font-medium text-brand-black">{settings?.phone || "+229 XX XX XX XX"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-red shadow-sm"><Mail /></div>
                <div>
                  <p className="text-xs font-semibold uppercase text-brand-black/50">Email</p>
                  <p className="font-medium text-brand-black">{settings?.email || "contact@pmosonsoser.com"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-red shadow-sm"><MapPin /></div>
                <div>
                  <p className="text-xs font-semibold uppercase text-brand-black/50">Adresse</p>
                  <p className="font-medium text-brand-black">{settings?.address || "Cotonou, Bénin"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="rounded-3xl border border-brand-black/5 bg-white p-6 md:p-8 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}