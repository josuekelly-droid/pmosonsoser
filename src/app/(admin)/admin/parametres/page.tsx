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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Configurez les coordonnées de l'entreprise, la livraison et les moyens de paiement.
        </p>
      </div>

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