import type { Metadata } from "next";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-red/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-start">
            
            {/* COLONNE INFOS DE CONTACT */}
            <div className="space-y-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
                  [ Support & Partenariat ]
                </span>
                <h1 className="mt-3 font-display text-4xl font-light tracking-wide text-white sm:text-5xl">
                  Parlons de votre <span className="italic font-serif text-brand-red">projet</span>
                </h1>
                <p className="mt-3 font-mono text-xs md:text-sm text-neutral-400 leading-relaxed">
                  Une question sur une moto, un besoin de pièce spécifique ou une demande de partenariat B2B ? Écrivez-nous.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Téléphone */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Téléphone</p>
                    <p className="font-mono text-sm font-medium text-white">{settings?.phone || "+229 XX XX XX XX"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Email</p>
                    <p className="font-mono text-sm font-medium text-white">{settings?.email || "contact@pmosonsoser.com"}</p>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Adresse</p>
                    <p className="font-mono text-sm font-medium text-white">{settings?.address || "Cotonou, Bénin"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE FORMULAIRE */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red block mb-2">
                [ Message direct ]
              </span>
              <h2 className="font-display text-2xl font-light text-white mb-6">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}