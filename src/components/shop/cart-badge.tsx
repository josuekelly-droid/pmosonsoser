"use client";

import { useCart } from "@/store/cart";

export function CartBadge() {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white shadow-lg shadow-brand-red/40">
      {count > 99 ? "99+" : count}
    </span>
  );
}