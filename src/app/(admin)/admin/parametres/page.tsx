import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Paramètres | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  let settings = await prisma.settings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "global" } });
  }

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Configuration Générale ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Paramètres
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Configurez les coordonnées de la plateforme, les barèmes de livraison géolocalisée et les paramètres des canaux de règlement.
        </p>
      </div>

      {/* FORMULAIRE CONFIGURATION COMPLET */}
      <SettingsForm
        initial={{
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          facebook: settings.facebook,
          instagram: settings.instagram,
          whatsapp: settings.whatsapp,
          baseFee: settings.baseFee,
          pricePerKm: settings.pricePerKm,
          freeDeliveryThreshold: settings.freeDeliveryThreshold,
          maxRadiusKm: settings.maxRadiusKm,
          bankName: settings.bankName,
          bankIban: settings.bankIban,
          bankHolder: settings.bankHolder,
          wuFirstName: settings.wuFirstName,
          wuLastName: settings.wuLastName,
          wuCity: settings.wuCity,
          wuCountry: settings.wuCountry,
        }}
      />
    </div>
  );
}