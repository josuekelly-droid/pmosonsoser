import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================
   LOGOS VECTORIELS (SVG personnalisés)
   ========================================= */

function MtnMomo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {/* Fond jaune MTN */}
      <rect width="64" height="40" rx="8" fill="#FFCC00" />
      {/* Ovale noir */}
      <ellipse cx="32" cy="20" rx="22" ry="12" fill="none" stroke="#1A1A1A" strokeWidth="3" />
      {/* Texte MTN */}
      <text x="32" y="25" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900" fill="#1A1A1A" letterSpacing="-0.5">MTN</text>
    </svg>
  );
}

function MoovMoney({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {/* Fond bleu Moov */}
      <rect width="64" height="40" rx="8" fill="#0066B3" />
      {/* Cercles entrelacés Moov */}
      <circle cx="24" cy="20" r="10" fill="#fff" opacity="0.9" />
      <circle cx="40" cy="20" r="10" fill="#FF6600" opacity="0.9" />
      <text x="32" y="33" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" fill="#fff">MOOV</text>
    </svg>
  );
}

function CeltiisCash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="celtiis-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8E24AA" />
          <stop offset="100%" stopColor="#D81B60" />
        </linearGradient>
      </defs>
      {/* Fond dégradé violet/rose */}
      <rect width="64" height="40" rx="8" fill="url(#celtiis-grad)" />
      {/* Vague stylisée */}
      <path d="M12 20 Q20 10 32 20 Q44 30 52 20" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="32" y="33" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="bold" fill="#fff" letterSpacing="1">CELTIIS</text>
    </svg>
  );
}

function WesternUnion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {/* Fond jaune WU */}
      <rect width="64" height="40" rx="8" fill="#FFDD00" />
      {/* Bandeau noir */}
      <rect width="64" height="8" rx="8" fill="#1A1A1A" />
      <rect y="8" width="64" height="1" fill="#1A1A1A" />
      {/* Texte WU */}
      <text x="32" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900" fill="#1A1A1A">WU</text>
      <text x="32" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="#1A1A1A" letterSpacing="0.5">WESTERN UNION</text>
    </svg>
  );
}

function BankTransfer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {/* Fond noir */}
      <rect width="64" height="40" rx="8" fill="#1A1A1A" />
      {/* Icône banque */}
      <g fill="none" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 8 L46 15 L18 15 Z" />
        <path d="M20 15 L20 28" />
        <path d="M26 15 L26 28" />
        <path d="M32 15 L32 28" />
        <path d="M38 15 L38 28" />
        <path d="M44 15 L44 28" />
        <path d="M16 28 L48 28" />
        <path d="M14 32 L50 32" />
      </g>
    </svg>
  );
}

/* =========================================
   LISTE DES MÉTHODES
   ========================================= */

const METHODS = [
  { key: "mtn", label: "MTN MoMo", Icon: MtnMomo },
  { key: "moov", label: "Moov Money", Icon: MoovMoney },
  { key: "celtiis", label: "Celtiis Cash", Icon: CeltiisCash },
  { key: "wu", label: "Western Union", Icon: WesternUnion },
  { key: "bank", label: "Virement", Icon: BankTransfer },
] as const;

/* =========================================
   COMPOSANT PRINCIPAL
   ========================================= */

export function PaymentBadges({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:flex-wrap md:gap-3", className)}>
      {METHODS.map(({ key, label, Icon }) => (
        <div
          key={key}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-brand-black/10 bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-md"
        >
          {/* Logo */}
          <Icon className="h-8 w-14 shrink-0 object-contain transition-transform group-hover:scale-105" />
          
          {/* Label (visible sur mobile, caché sur PC si trop grand) */}
          <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-brand-black/60 group-hover:text-brand-black md:hidden">
            {label}
          </span>

          {/* Tooltip sur PC (survol) */}
          <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-black px-3 py-1.5 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block">
            {label}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-black" />
          </div>
        </div>
      ))}
    </div>
  );
}