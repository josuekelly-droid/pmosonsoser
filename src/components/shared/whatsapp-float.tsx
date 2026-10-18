import { prisma } from "@/lib/prisma";
import { MessageCircle } from "lucide-react";

export async function WhatsAppFloat() {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  const rawNumber = settings?.whatsapp || settings?.phone;
  
  if (!rawNumber) return null;

  // Nettoie le numéro pour ne garder que les chiffres (ex: "+229 97..." -> "22997...")
  const phone = rawNumber.replace(/\D/g, "");
  const message = encodeURIComponent("Bonjour PM Osons Oser, j'aimerais avoir des informations.");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-600/30 transition-all hover:scale-110 hover:bg-[#20ba5a] md:bottom-8 md:right-8 md:h-16 md:w-16"
    >
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
      
      {/* Effet de pulsation discret */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30 group-hover:hidden" />
    </a>
  );
}