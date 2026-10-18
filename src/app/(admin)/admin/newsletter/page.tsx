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
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
            [ Marketing & Diffusion ]
          </span>
          <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
            Newsletter
          </h1>
          <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
            {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""} inscrit{subscribers.length > 1 ? "s" : ""} à la liste de diffusion.
          </p>
        </div>

        {/* BOUTON D'EXPORTATION CSV HUD */}
        <a
          href="/api/admin/newsletter/export"
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-brand-red/50 hover:bg-brand-red hover:text-white hover:shadow-lg hover:shadow-brand-red/30"
        >
          <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          <span>Exporter la liste CSV</span>
        </a>
      </div>

      {/* TABLEAU GLASSMORPHISM */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-2xl">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
              <Mail className="h-8 w-8" />
            </div>
            <p className="mt-4 font-mono text-xs md:text-sm text-neutral-400">
              Aucun abonné enregistré pour le moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Adresse Email
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-bold text-white">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      {new Date(s.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400 backdrop-blur-md">
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}