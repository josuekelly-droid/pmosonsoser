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
import { cn, formatPrice } from "@/lib/utils";

const LABELS: Record<string, string> = {
  admin: "Vue d'ensemble",
  produits: "Produits",
  commandes: "Commandes",
  utilisateurs: "Utilisateurs",
  avis: "Avis clients",
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
    const interval = setInterval(fetchNotifications, 30000); // Toutes les 30s
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

  // --- Raccourci clavier (Cmd+K ou Ctrl+K) ---
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

  // --- Click outside pour notif ---
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
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 bg-brand-gray/80 pl-16 pr-4 backdrop-blur-xl md:pl-8 md:pr-8">
        {/* Breadcrumb (Desktop seulement pour éviter le chevauchement avec le hamburger) */}
        <nav className="hidden min-w-0 flex-1 items-center gap-2 text-sm md:flex">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span className="truncate font-display text-xl tracking-wide text-brand-black">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="truncate text-brand-black/40 transition hover:text-brand-black">
                      {c.label}
                    </Link>
                    <ChevronRight className="h-4 w-4 shrink-0 text-brand-black/20" />
                  </>
                )}
              </span>
            );
          })}
        </nav>

        {/* Titre Mobile */}
        <span className="truncate font-display text-lg text-brand-black md:hidden">
      
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Recherche */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-3 text-brand-black/50 shadow-sm transition hover:text-brand-black md:w-64 md:px-4"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden text-sm md:inline">Rechercher…</span>
            <kbd className="ml-auto hidden rounded border border-brand-black/10 px-1.5 text-[10px] font-mono md:inline">⌘K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-black/60 shadow-sm transition hover:text-brand-black"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white ring-2 ring-brand-gray">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {notifOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-brand-black/5 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-brand-black/5 px-4 py-3">
                  <h3 className="font-display text-sm tracking-wide text-brand-black">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-semibold text-brand-red hover:underline">
                      <Check className="h-3 w-3" /> Tout lire
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-brand-black/50">Aucune notification</p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "#"}
                        onClick={() => setNotifOpen(false)}
                        className={cn(
                          "block border-b border-brand-black/5 p-4 transition hover:bg-brand-gray/50",
                          !n.isRead && "bg-brand-red/5"
                        )}
                      >
                        <p className="text-xs font-semibold text-brand-black">{n.title}</p>
                        <p className="mt-1 text-[11px] text-brand-black/60 line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[9px] text-brand-black/40">
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

      {/* Modale de Recherche */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border-b border-brand-black/5 px-4">
              <Search className="h-5 w-5 text-brand-black/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une commande, un client…"
                className="h-14 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-brand-black/30"
              />
              <button onClick={() => setSearchOpen(false)} className="text-brand-black/40 hover:text-brand-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <p className="py-8 text-center text-sm text-brand-black/50">Aucun résultat pour "{searchQuery}"</p>
              ) : (
                searchResults.map((r) => {
                  const Icon = r.type === "product" ? Package : r.type === "order" ? ShoppingCart : User;
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => { router.push(r.href); setSearchOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-brand-gray"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gray text-brand-black/60">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-black">{r.title}</p>
                        <p className="truncate text-xs text-brand-black/50">{r.subtitle}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-brand-black/20" />
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