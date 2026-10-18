import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Mail, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
            Newsletter
          </h1>
          <p className="mt-1 text-sm text-brand-black/60">
            {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""} à votre liste de diffusion.
          </p>
        </div>
        
        {/* Le bouton d'export utilise l'API Route qu'on va créer juste après */}
        <a
          href="/api/admin/newsletter/export"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-black px-5 text-sm font-semibold text-white transition hover:bg-brand-red"
        >
          <Download className="h-4 w-4" />
          Exporter en CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-black/5 bg-white">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-12 w-12 text-brand-black/20" />
            <p className="mt-3 text-sm text-brand-black/50">
              Aucun abonné pour le moment.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-black/5 bg-brand-gray/40">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Date d'inscription
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-brand-black/50">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-brand-black/5 last:border-0 hover:bg-brand-gray/20">
                  <td className="px-4 py-3 text-sm font-medium text-brand-black">
                    {s.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-black/60">
                    {new Date(s.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-green-700">
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}