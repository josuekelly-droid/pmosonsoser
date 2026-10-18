import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/client/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { name: true, email: true, phone: true, typeCompte: true, statutValidation: true }
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* EN-TÊTE DE SECTION */}
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
          [ Paramètres ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light text-white md:text-4xl">
          Mon Profil
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Gérez vos informations personnelles et les paramètres de votre compte.
        </p>
      </div>

      <ProfileForm initialData={user} />
    </div>
  );
}