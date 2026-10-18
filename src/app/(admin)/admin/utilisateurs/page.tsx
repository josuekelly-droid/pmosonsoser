import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = {
  title: "Utilisateurs | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUtilisateursPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      typeCompte: true,
      statutValidation: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Gestion des Comptes & Privilèges ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Utilisateurs
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Gérez les comptes clients, validez les accès professionnels B2B/Premium et attribuez les privilèges administrateur.
        </p>
      </div>

      {/* TABLEAU COMPLET ET FILTRES GLASSMORPHISM */}
      <UsersTable initialUsers={users} />
    </div>
  );
}