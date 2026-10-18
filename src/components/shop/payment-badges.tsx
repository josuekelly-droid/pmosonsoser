import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================
   LOGOS VECTORIELS HIGH-END (SVG Awwwards)
   ========================================= */

function MtnMomo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <rect width="64" height="40" rx="10" fill="#FFCC00" />
      <ellipse cx="32" cy="20" rx="20" ry="11" fill="none" stroke="#000000" strokeWidth="2.5" />
      <text
        x="32"
        y="24"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#000000"
        letterSpacing="-0.5"
      >
        MTN
      </text>
    </svg>
  );
}

function MoovMoney({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <rect width="64" height="40" rx="10" fill="#005CA9" />
      <circle cx="25" cy="20" r="9" fill="#FFFFFF" opacity="0.9" />
      <circle cx="39" cy="20" r="9" fill="#FF6600" opacity="0.9" />
      <text
        x="32"
        y="34"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fontWeight="bold"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        MOOV
      </text>
    </svg>
  );
}

function CeltiisCash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="celtiis-grad-awwwards" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B1FA2" />
          <stop offset="100%" stopColor="#C2185B" />
        </linearGradient>
      </defs>
      <rect width="64" height="40" rx="10" fill="url(#celtiis-grad-awwwards)" />
      <path
        d="M14 20 Q22 11 32 20 Q42 29 50 20"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fontWeight="bold"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        CELTIIS
      </text>
    </svg>
  );
}

function WesternUnion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <rect width="64" height="40" rx="10" fill="#FFDD00" />
      <rect width="64" height="7" rx="10" fill="#000000" />
      <text
        x="32"
        y="23"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="13"
        fontWeight="900"
        fill="#000000"
      >
        WU
      </text>
      <text
        x="32"
        y="33"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="5.5"
        fontWeight="bold"
        fill="#000000"
        letterSpacing="0.5"
      >
        WESTERN UNION
      </text>
    </svg>
  );
}

function BankTransfer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <rect width="64" height="40" rx="10" fill="#121214" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <g fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 9 L46 16 L18 16 Z" />
        <path d="M20 16 L20 27" />
        <path d="M26 16 L26 27" />
        <path d="M32 16 L32 27" />
        <path d="M38 16 L38 27" />
        <path d="M44 16 L44 27" />
        <path d="M16 27 L48 27" />
        <path d="M14 31 L50 31" />
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
  { key: "bank", label: "Virement Bancaire", Icon: BankTransfer },
] as const;

/* =========================================
   COMPOSANT PRINCIPAL
   ========================================= */

export function PaymentBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {METHODS.map(({ key, label, Icon }) => (
        <div
          key={key}
          className="group relative flex items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-2.5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-red/40 hover:bg-neutral-900/90 hover:shadow-[0_10px_20px_rgba(239,68,68,0.15)]"
        >
          {/* Logo vectoriel */}
          <Icon className="h-8 w-14 shrink-0 object-contain transition-transform duration-500 group-hover:scale-105" />

          {/* Label mobile */}
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400 group-hover:text-white md:hidden">
            {label}
          </span>

          {/* Tooltip Floating HUD Desktop */}
          <div className="pointer-events-none absolute -top-11 left-1/2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-neutral-950 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:opacity-100 md:block">
            {label}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/15 bg-neutral-950" />
          </div>
        </div>
      ))}
    </div>
  );
}