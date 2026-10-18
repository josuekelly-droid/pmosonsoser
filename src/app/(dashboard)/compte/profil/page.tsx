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
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-brand-black">Mon profil</h1>
      <ProfileForm initialData={user} />
    </div>
  );
}