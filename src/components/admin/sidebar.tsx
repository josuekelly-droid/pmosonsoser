"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Mail,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/utilisateurs", label: "Clients", icon: Users },
  { href: "/admin/avis", label: "Avis", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-red/10 ring-1 ring-brand-red/20">
          <Image
            src="/logo/pm-osons-oser-1.jpg"
            alt="PM"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg leading-none tracking-wider text-brand-black">
            PM <span className="text-brand-red">OSONS</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-brand-black/40">
            Administration
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    active
                      ? "text-brand-red"
                      : "text-brand-black/60 hover:bg-brand-gray hover:text-brand-black"
                  )}
                >
                  {/* Effet de lueur (glow) actif */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-light"
                      className="absolute inset-0 rounded-2xl border border-brand-red/20 bg-brand-red/5 shadow-[0_0_20px_rgba(227,6,19,0.08)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-3.5">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        active ? "text-brand-red" : "text-brand-black/40 group-hover:text-brand-black"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Ligne lumineuse sur le côté gauche */}
                  {active && (
                    <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-red shadow-[0_0_10px_rgba(227,6,19,0.6)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t border-brand-black/5 pt-6">
          <Link
            href="/"
            target="_blank"
            className="group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium text-brand-black/50 transition-all hover:bg-brand-gray hover:text-brand-black"
          >
            <Home className="h-5 w-5 transition-colors group-hover:text-brand-black" />
            <span>Boutique publique</span>
          </Link>
        </div>
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4">
        <div className="rounded-2xl border border-brand-black/5 bg-brand-gray/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red text-sm font-bold text-white shadow-lg shadow-brand-red/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-black">
                {userName}
              </p>
              <p className="truncate text-[11px] text-brand-black/50">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2 text-xs font-medium text-brand-black/60 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-black shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar Desktop (Flottante) */}
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-[260px] flex-col overflow-hidden rounded-3xl border border-brand-black/5 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] lg:flex">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-4 left-4 z-50 w-[260px] overflow-hidden rounded-3xl border border-brand-black/5 bg-white shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray text-brand-black/60 hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}