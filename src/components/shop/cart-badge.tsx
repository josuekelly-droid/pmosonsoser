"use client";

import { useCart } from "@/store/cart";

export function CartBadge() {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  if (count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-neutral-950 bg-brand-red px-1.5 font-mono text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] transition-all duration-300">
      {count > 99 ? "99+" : count}
      {/* Halo de pulsation subtil */}
      <span className="absolute -inset-0.5 -z-10 animate-ping rounded-full bg-brand-red/50 opacity-75" />
    </span>
  );
}