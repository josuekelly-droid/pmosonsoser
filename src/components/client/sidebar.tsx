"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  User,
  Crown,
  LogOut,
  Store,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/compte", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/profil", label: "Mon profil", icon: User },
];

export function ClientSidebar({
  userName,
  userEmail,
  typeCompte,
}: {
  userName: string;
  userEmail: string;
  typeCompte: string;
}) {
  const pathname = usePathname();

  const isB2B = typeCompte === "B2B" || typeCompte === "PREMIUM";

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-xl">
      {/* Halo lumineux ambiant */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-red/10 blur-[80px]" />

      {/* PROFIL RÉSUMÉ */}
      <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red font-mono text-base font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-medium text-white">
            {userName}
          </p>
          <p className="truncate font-mono text-[11px] text-neutral-500">
            {userEmail}
          </p>
        </div>
      </div>

      {/* BADGE B2B / GROSSISTE */}
      {isB2B && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 font-mono text-xs text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
          <Store className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="font-semibold uppercase tracking-wider">
            Compte Professionnel
          </span>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="mt-5 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                active
                  ? "font-bold text-white"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="client-nav-active"
                  className="absolute inset-0 rounded-2xl border border-brand-red/40 bg-brand-red/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Barre néon latérale ajustée */}
              {active && (
                <span className="absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-red shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}

              <Icon
                className={cn(
                  "relative z-10 h-4 w-4 transition-colors duration-300",
                  active ? "text-brand-red" : "text-neutral-500 group-hover:text-white"
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}

        {/* LIEN DEVENIR PRO (si B2C) */}
        {!isB2B && (
          <Link
            href="/compte/devenir-pro"
            className="group mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-brand-red/40 bg-brand-red/5 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-all duration-300 hover:border-brand-red hover:bg-brand-red hover:text-white"
          >
            <Crown className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
            <span>Devenir Professionnel</span>
          </Link>
        )}
      </nav>

      {/* DÉCONNEXION */}
      <div className="mt-8 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 py-3 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}