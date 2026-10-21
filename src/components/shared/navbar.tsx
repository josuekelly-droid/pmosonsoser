"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/shop/search-modal";
import { CartBadge } from "@/components/shop/cart-badge"; // ⬅️ IMPORT DU BADGE

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/motos", label: "Motos" },
  { href: "/tricycles", label: "Tricycles" },
  { href: "/pieces-detachees", label: "Pièces" },
  { href: "/lubrifiants", label: "Lubrifiants" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Effet de scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer les menus au changement de page
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Fermer le menu utilisateur lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Raccourci clavier Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const dashboardUrl = isAdmin ? "/admin" : "/compte";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-8 md:pt-6">
        <nav
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border px-3 transition-all duration-700 md:h-18 md:px-4",
            scrolled
              ? "border-white/15 bg-neutral-950/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              : "border-white/10 bg-neutral-900/40 backdrop-blur-xl"
          )}
        >
          {/* LOGO */}
          <Link href="/" className="group flex shrink-0 items-center gap-3.5 pl-1">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20 transition-transform duration-500 group-hover:scale-105 md:h-11 md:w-11">
              <Image
                src="/logo/pm-osons-oser-1.jpg"
                alt="PM Osons Oser"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden font-display text-lg font-light tracking-wider text-white md:block">
              PM <span className="font-bold text-brand-red">OSONS OSER</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                      active
                        ? "text-white font-semibold"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-red shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            
            {/* BOUTON RECHERCHE */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
              className="group flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs text-neutral-400 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Search className="h-4 w-4 text-neutral-300 transition-transform group-hover:scale-110" />
              <span className="hidden font-mono text-[11px] lg:inline-block">Recherche</span>
              <kbd className="hidden rounded border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 lg:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* ⬇️ BOUTON PANIER AVEC TON BADGE ⬇️ */}
            <Link
              href="/panier"
              aria-label="Panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              <CartBadge />
            </Link>

            {/* AUTHENTIFICATION / MENU USER */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-white/10 pl-1.5 pr-3.5 transition-all duration-300 hover:border-white/30 hover:bg-white/15"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white shadow-inner">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden max-w-[90px] truncate font-mono text-xs font-medium text-white md:block">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform duration-300", userMenuOpen && "rotate-180")} />
                </button>

                {/* DROPDOWN USER */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-2xl">
                    <div className="border-b border-white/10 p-4">
                      <p className="truncate text-sm font-medium text-white">{session.user?.name}</p>
                      <p className="truncate font-mono text-xs text-neutral-400">{session.user?.email}</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Link
                        href={dashboardUrl}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 font-mono text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4 text-brand-red" />
                        {isAdmin ? "Tableau de Bord Admin" : "Mon Espace"}
                      </Link>
                      {!isAdmin && (
                        <Link
                          href="/compte/commandes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 font-mono text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Package className="h-4 w-4 text-brand-red" />
                          Mes Commandes
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-mono text-xs text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="hidden h-10 items-center gap-2 rounded-full bg-brand-red px-6 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-300 hover:bg-white hover:text-black md:inline-flex"
              >
                <User className="h-4 w-4" />
                Connexion
              </Link>
            )}

            {/* BURGER MOBILE */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors lg:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* MENU MOBILE OVERLAY */}
      {isOpen && (
        <div className="fixed inset-x-4 top-22 z-50 overflow-hidden rounded-[2rem] border border-white/15 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-2xl lg:hidden">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-2xl px-5 py-3.5 font-display text-lg tracking-wide transition-colors",
                    pathname === link.href
                      ? "bg-brand-red text-white"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <Link
                  href={dashboardUrl}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-brand-red px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Espace Personnel
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-brand-red px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white"
                >
                  <User className="h-4 w-4" />
                  Espace Connexion
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* MODALE DE RECHERCHE */}
      <SearchModal isOpen={searchOpen} onCloseAction={() => setSearchOpen(false)} />
    </>
  );
}