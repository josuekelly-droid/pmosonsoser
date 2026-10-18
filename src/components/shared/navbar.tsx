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
import { SearchModal } from "@/components/shop/search-modal"; // ⬅️ NOUVEL IMPORT

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
  const [searchOpen, setSearchOpen] = useState(false); // ⬅️ NOUVEAU STATE
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Effet de scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Fermer le menu user au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Raccourci clavier Ctrl+K / Cmd+K pour la recherche
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
      <div className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
        <nav
          className={cn(
            "mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full border px-2 transition-all duration-500 md:h-16 md:px-3",
            scrolled
              ? "border-white/10 bg-brand-black/85 shadow-2xl shadow-black/40 backdrop-blur-2xl"
              : "border-white/5 bg-brand-black/60 backdrop-blur-xl"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3 pl-1">
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-brand-red/40 transition hover:ring-brand-red md:h-11 md:w-11">
              <Image
                src="/logo/pm-osons-oser-1.jpg"
                alt="PM Osons Oser"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden font-display text-lg leading-none tracking-wide text-white md:block">
              PM <span className="text-brand-red">OSONS OSER</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
                      active ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-red" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* ⬇️ BOUTON RECHERCHE FONCTIONNEL ⬇️ */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/panier"
              aria-label="Panier"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-red" />
            </Link>

            {/* CONDITION : Connecté ou pas */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 items-center gap-2 rounded-full bg-white/10 pl-1 pr-3 transition hover:bg-white/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden max-w-[80px] truncate text-xs font-medium text-white md:block">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-white/60 transition", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-brand-black/95 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 p-4">
                      <p className="truncate text-sm font-semibold text-white">{session.user?.name}</p>
                      <p className="truncate text-xs text-white/50">{session.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href={dashboardUrl}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <LayoutDashboard className="h-4 w-4 text-brand-red" />
                        {isAdmin ? "Tableau de bord Admin" : "Mon compte"}
                      </Link>
                      {!isAdmin && (
                        <Link
                          href="/compte/commandes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                          <Package className="h-4 w-4 text-brand-red" />
                          Mes commandes
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="hidden h-10 items-center gap-2 rounded-full bg-brand-red px-5 text-sm font-semibold text-white shadow-lg shadow-brand-red/30 transition hover:bg-brand-red/90 md:inline-flex"
              >
                <User className="h-4 w-4" />
                Connexion
              </Link>
            )}

            {/* Burger Mobile */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed left-3 right-3 top-20 z-50 rounded-3xl border border-white/10 bg-brand-black/95 p-5 shadow-2xl backdrop-blur-2xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    pathname === link.href
                      ? "bg-brand-red text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            <li className="pt-2">
              {isLoggedIn ? (
                <Link
                  href={dashboardUrl}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-base font-semibold text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mon compte
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-base font-semibold text-white"
                >
                  <User className="h-4 w-4" />
                  Connexion / Inscription
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* ⬇️ LA MODALE DE RECHERCHE ⬇️ */}
      <SearchModal isOpen={searchOpen} onCloseAction={() => setSearchOpen(false)} />
    </>
  );
}