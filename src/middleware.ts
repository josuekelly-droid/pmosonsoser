import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/compte", "/checkout", "/commande", "/admin"];
const AUTH_PAGES = ["/connexion", "/inscription", "/mot-de-passe-oublie"];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = (req.auth?.user as any)?.role;

  /* ---------- 1. Utilisateur connecté sur page auth → home ---------- */
  if (isLoggedIn && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /* ---------- 2. Routes /admin → ADMIN uniquement ---------- */
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isLoggedIn) {
      const url = new URL("/connexion", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /* ---------- 3. Autres routes protégées → connecté ---------- */
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAuth && !isLoggedIn) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo|categories|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};