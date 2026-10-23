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
  ArrowUpRight,
  Tag,
  Layers,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/marques", label: "Marques", icon: Tag },
  { href: "/admin/categories", label: "Catégories", icon: Layers },
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
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* LOGO BRANDING DARK LUXURY */}
        <div className="flex items-center gap-3.5 px-6 py-8">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-brand-red/30 bg-brand-red/10 shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-2xl">
            <Image
              src="/logo/pm-osons-oser-1.jpg"
              alt="PM"
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-wide text-white">
              PM <span className="text-brand-red font-serif italic">OSONS</span>
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              [ Console Admin ]
            </span>
          </div>
        </div>

        {/* NAVIGATION HUD */}
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                      active
                        ? "text-white"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {/* Effet de lueur (glow) néon actif */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-glow"
                        className="absolute inset-0 rounded-2xl border border-brand-red/40 bg-brand-red/10 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-md"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-300",
                          active ? "text-brand-red" : "text-neutral-500 group-hover:text-white"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {/* Ligne lumineuse rouge néon sur le flanc gauche */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-red shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-wider text-neutral-400 backdrop-blur-md transition-all hover:border-white/20 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Home className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-white" />
                <span>Boutique publique</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </nav>
      </div>

      {/* PROFIL ADMINISTRATEUR */}
      <div className="p-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/20 font-display text-sm font-light text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-xs font-semibold text-white">
                {userName}
              </p>
              <p className="truncate font-mono text-[10px] text-neutral-400">{userEmail}</p>
            </div>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-neutral-300 backdrop-blur-md transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton Toggle Mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu administration"
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/80 text-white shadow-2xl backdrop-blur-2xl lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar Desktop Flottante */}
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-[270px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:flex">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile Tiroir */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-4 left-4 z-50 w-[270px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/90 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu administration"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white"
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