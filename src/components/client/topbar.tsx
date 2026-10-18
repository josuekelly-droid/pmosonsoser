"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
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
    <header className="sticky top-0 z-30 border-b border-brand-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
        
        {/* Logo + Lien boutique */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-brand-red/20">
              <Image
                src="/logo/pm-osons-oser-1.jpg"
                alt="PM Osons Oser"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <span className="hidden font-display text-lg tracking-wide text-brand-black md:block">
              Mon <span className="text-brand-red">Compte</span>
            </span>
          </Link>

          <span className="hidden h-4 w-px bg-brand-black/10 md:block" />

          <Link
            href="/"
            className="hidden items-center gap-2 text-sm font-medium text-brand-black/60 transition hover:text-brand-black md:flex"
          >
            <Home className="h-4 w-4" />
            Retour à la boutique
          </Link>
        </div>

        {/* Actions (Menu Profil uniquement) */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full bg-brand-gray py-1 pl-1 pr-3 transition hover:bg-brand-black/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[100px] truncate text-sm font-medium text-brand-black md:block">
                {userName}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-brand-black/40 transition", profileOpen && "rotate-180")} />
            </button>

            {/* Dropdown Profil */}
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-brand-black/5 bg-white shadow-2xl">
                <div className="border-b border-brand-black/5 p-4">
                  <p className="truncate text-sm font-semibold text-brand-black">{userName}</p>
                  <p className="truncate text-xs text-brand-black/50">{userEmail}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/compte/profil"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-brand-black transition hover:bg-brand-gray"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4 text-brand-black/40" />
                    Mon profil
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
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