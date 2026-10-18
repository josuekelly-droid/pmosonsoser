import { prisma } from "@/lib/prisma";
import { MessageCircle, ArrowUpRight } from "lucide-react";

export async function WhatsAppFloat() {
  let settings = null;
  try {
    settings = await prisma.settings.findUnique({ where: { id: "global" } });
  } catch (error) {
    console.warn("⚠️ [WhatsAppFloat] DB indisponible.");
  }

  const rawNumber = settings?.whatsapp || settings?.phone;
  if (!rawNumber) return null;

  // Nettoyage du numéro
  const phone = rawNumber.replace(/\D/g, "");
  const message = encodeURIComponent(
    "Bonjour PM Osons Oser, j'aimerais avoir des informations sur votre catalogue."
  );
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-neutral-900/80 p-2 pl-3 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-105 hover:border-[#25D366]/50 hover:bg-neutral-900 md:bottom-8 md:right-8"
    >
      {/* Badge statut en direct (visible sur desktop & hover) */}
      <div className="hidden flex-col pr-1 md:flex">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
          <span>Support WhatsApp</span>
        </div>
        <span className="font-mono text-[9px] text-neutral-500">
          Réponse instantanée
        </span>
      </div>

      {/* Bouton d'action principal */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform duration-500 group-hover:rotate-12 md:h-12 md:w-12">
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />

        {/* Halo de pulsation subtil */}
        <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-[#25D366]/40 opacity-75 group-hover:hidden" />
      </div>

      {/* Flèche Awwwards sur hover */}
      <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white transition-all duration-500 group-hover:bg-white group-hover:text-black md:flex">
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
      </div>
    </a>
  );
}