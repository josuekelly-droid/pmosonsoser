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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Gérez les comptes clients, validez les demandes pro, attribuez les rôles admin.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}