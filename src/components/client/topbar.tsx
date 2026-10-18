"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, LogOut, User, ChevronDown, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ClientTopbar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/80 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 md:px-8">
        {/* LOGO + RETOUR BOUTIQUE */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20 p-0.5 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo/pm-osons-oser-1.jpg"
                alt="PM Osons Oser"
                fill
                sizes="40px"
                className="rounded-full object-cover"
              />
            </div>
            <div className="hidden flex-col md:flex">
              <span className="font-display text-lg font-light tracking-wide text-white">
                Espace <span className="italic font-serif text-brand-red">Client</span>
              </span>
            </div>
          </Link>

          <span className="hidden h-5 w-px bg-white/10 md:block" />

          <Link
            href="/"
            className="group hidden items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors duration-300 hover:text-white md:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Retour à la boutique</span>
          </Link>
        </div>

        {/* MENU PROFIL / ACTIONS */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              {/* Initiale dans un cercle avec glow */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red font-mono text-xs font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[120px] truncate font-sans text-xs font-medium text-white md:block">
                {userName}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-neutral-400 transition-transform duration-300",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {/* DROPDOWN MENU DARK LUXURY */}
            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                {/* Entête avec infos utilisateur */}
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate font-sans text-sm font-medium text-white">
                    {userName}
                  </p>
                  <p className="truncate font-mono text-[10px] text-neutral-500">
                    {userEmail}
                  </p>
                </div>

                {/* Liens d'action */}
                <div className="mt-1 space-y-1 p-1">
                  <Link
                    href="/compte/profil"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-mono text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                  >
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>Mon profil</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 font-mono text-xs uppercase tracking-widest text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}