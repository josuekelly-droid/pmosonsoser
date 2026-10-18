"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronRight,
  Loader2,
  ShoppingCart,
  Package,
  User,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  admin: "Vue d'ensemble",
  produits: "Produits",
  commandes: "Commandes",
  utilisateurs: "Utilisateurs",
  avis: "Avis clients",
  newsletter: "Newsletter",
  parametres: "Paramètres",
  nouveau: "Nouveau",
  modifier: "Modifier",
};

function buildBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ label: LABELS[seg] || seg, href: acc });
  }
  return crumbs;
}

type SearchResult = {
  type: "product" | "order" | "user";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function AdminTopbar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = buildBreadcrumb(pathname);

  // --- État Recherche ---
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- État Notifications ---
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // --- Fetch Notifications ---
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- Recherche (debounce) ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Raccourci clavier (Cmd+K) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Click outside notifications ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", { method: "PATCH" });
    fetchNotifications();
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-white/10 bg-[#0A0A0B]/80 pl-16 pr-4 backdrop-blur-2xl md:pl-8 md:pr-8">
        {/* BREADCRUMB HUD */}
        <nav className="hidden min-w-0 flex-1 items-center gap-2 text-xs md:flex font-mono">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span className="truncate font-display text-xl font-light tracking-wide text-white">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="truncate text-neutral-400 transition-colors hover:text-white uppercase tracking-wider">
                      {c.label}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                  </>
                )}
              </span>
            );
          })}
        </nav>

        {/* ACTIONS & OUTILS HUD */}
        <div className="flex items-center gap-3">
          {/* Recherche Déclencheur */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            className="flex h-11 items-center gap-3 rounded-full border border-white/10 bg-neutral-900/40 px-4 font-mono text-xs text-neutral-400 backdrop-blur-md transition-all hover:border-brand-red/50 hover:text-white md:w-64"
          >
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="hidden md:inline">Rechercher…</span>
            <kbd className="ml-auto hidden rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-neutral-400 md:inline">⌘K</kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Voir les notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-neutral-900/40 text-neutral-300 backdrop-blur-md transition-all hover:border-brand-red/50 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 font-mono text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Menu Déroulant Notifications Glassmorphism */}
            {notifOpen && (
              <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/90 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 font-mono text-[10px] uppercase text-brand-red hover:underline">
                      <Check className="h-3 w-3" /> Tout lire
                    </button>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center font-mono text-xs text-neutral-500">Aucune notification disponible.</p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "#"}
                        onClick={() => setNotifOpen(false)}
                        className={cn(
                          "block p-4 transition-colors hover:bg-white/[0.03]",
                          !n.isRead && "bg-brand-red/5 border-l-2 border-brand-red"
                        )}
                      >
                        <p className="font-sans text-xs font-semibold text-white">{n.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-neutral-400 line-clamp-2">{n.message}</p>
                        <p className="mt-1.5 font-mono text-[9px] text-neutral-500">
                          {new Date(n.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODALE OMNIBOX RECHERCHE HUD */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-[10vh] backdrop-blur-md" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/90 shadow-2xl backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border-b border-white/10 px-6 py-2">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une commande, un client…"
                className="h-14 flex-1 bg-transparent px-4 font-mono text-sm text-white placeholder-neutral-500 outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-3">
              {searching ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <p className="py-10 text-center font-mono text-xs text-neutral-400">Aucun résultat trouvé pour «&nbsp;{searchQuery}&nbsp;»</p>
              ) : (
                searchResults.map((r) => {
                  const Icon = r.type === "product" ? Package : r.type === "order" ? ShoppingCart : User;
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => { router.push(r.href); setSearchOpen(false); }}
                      className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-neutral-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-white">{r.title}</p>
                        <p className="truncate font-mono text-xs text-neutral-400">{r.subtitle}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-600" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}