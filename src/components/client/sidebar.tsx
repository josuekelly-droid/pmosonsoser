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
    <div className="rounded-3xl border border-brand-black/5 bg-white p-4 shadow-sm">
      {/* Profil résumé */}
      <div className="flex items-center gap-3 border-b border-brand-black/5 pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red text-lg font-bold text-white shadow-md shadow-brand-red/20">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-black">
            {userName}
          </p>
          <p className="truncate text-[11px] text-brand-black/50">{userEmail}</p>
        </div>
      </div>

      {/* Badge B2B */}
      {isB2B && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-red/5 p-2.5">
          <Store className="h-4 w-4 text-brand-red" />
          <span className="text-xs font-semibold text-brand-red">
            Compte Professionnel
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-brand-red"
                  : "text-brand-black/60 hover:bg-brand-gray hover:text-brand-black"
              )}
            >
              {active && (
                <motion.span
                  layoutId="client-nav-active"
                  className="absolute inset-0 rounded-xl bg-brand-red/5 shadow-[0_0_15px_rgba(227,6,19,0.05)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5",
                  active ? "text-brand-red" : "text-brand-black/40"
                )}
              />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <span className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-red" />
              )}
            </Link>
          );
        })}

        {/* Lien Premium si pas encore B2B/Premium */}
        {!isB2B && (
          <Link
            href="/compte/devenir-pro"
            className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-brand-red/30 px-4 py-3 text-sm font-medium text-brand-red transition hover:bg-brand-red/5"
          >
            <Crown className="h-5 w-5" />
            Devenir Professionnel
          </Link>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="mt-6 border-t border-brand-black/5 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gray py-2.5 text-xs font-medium text-brand-black/60 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}