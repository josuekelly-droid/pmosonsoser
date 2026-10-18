import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getIsB2BValidated(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { typeCompte: true, statutValidation: true },
  });

  if (!user) return false;

  return (
    (user.typeCompte === "B2B" || user.typeCompte === "PREMIUM") &&
    user.statutValidation === "VALIDE"
  );
}