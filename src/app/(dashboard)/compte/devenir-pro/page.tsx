import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpgradeB2BButton } from "@/components/client/upgrade-b2b-button";
import { Store, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevenirProPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { typeCompte: true, statutValidation: true },
  });

  if (!user) redirect("/compte");

  // --- CAS 1 : Déjà validé ---
  if (user.typeCompte === "B2B" && user.statutValidation === "VALIDE") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 font-display text-3xl text-green-900">Compte Professionnel Actif</h1>
        <p className="mt-2 text-sm text-green-700/80">
          Félicitations ! Vous bénéficiez désormais des prix dégressifs B2B sur tout le catalogue.
        </p>
      </div>
    );
  }

  // --- CAS 2 : En attente de validation ---
  if (user.typeCompte === "B2B" && user.statutValidation === "EN_ATTENTE") {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
        <Clock className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 font-display text-3xl text-amber-900">Demande en cours d'examen</h1>
        <p className="mt-2 text-sm text-amber-700/80">
          Votre demande a bien été reçue. Notre équipe la valide sous 24h ouvrées. Vous recevrez une notification dès activation.
        </p>
      </div>
    );
  }

  // --- CAS 3 : Client B2C qui veut passer Pro ---
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-black/5 bg-white p-8 text-center md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-red/10">
          <Store className="h-10 w-10 text-brand-red" />
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Devenez Partenaire Professionnel
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-brand-black/60">
          Rejoignez notre réseau de garages et revendeurs. En un clic, soumettez votre demande pour accéder aux tarifs de gros sur l'ensemble de nos motos, tricycles, pièces et lubrifiants.
        </p>

        <ul className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left text-sm text-brand-black/70">
          <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-red shrink-0" /> Prix dégressifs sur tout le catalogue</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-red shrink-0" /> Livraison prioritaire</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-red shrink-0" /> Accès à un interlocuteur dédié</li>
        </ul>

        <div className="mt-10">
          <UpgradeB2BButton />
        </div>
      </div>
    </div>
  );
}