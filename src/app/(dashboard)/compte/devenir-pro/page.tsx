import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpgradeB2BButton } from "@/components/client/upgrade-b2b-button";
import { Store, CheckCircle2, Clock, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-neutral-900/40 p-10 text-center backdrop-blur-2xl md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
        
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
          [ Statut Professionnel ]
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-white md:text-4xl">
          Compte Professionnel Actif
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Félicitations ! Vous bénéficiez désormais des prix dégressifs et des avantages exclusifs B2B sur l'ensemble de notre catalogue.
        </p>
      </div>
    );
  }

  // --- CAS 2 : En attente de validation ---
  if (user.typeCompte === "B2B" && user.statutValidation === "EN_ATTENTE") {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-neutral-900/40 p-10 text-center backdrop-blur-2xl md:p-14">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>

        <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-amber-400">
          [ Dossier en cours ]
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-white md:text-4xl">
          Demande en cours d'examen
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Votre demande a bien été transmise à notre équipe. Elle est validée sous 24h ouvrées. Une notification vous sera envoyée dès l'activation.
        </p>
      </div>
    );
  }

  // --- CAS 3 : Client B2C qui veut passer Pro ---
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 text-center backdrop-blur-2xl md:p-12">
        {/* Halo lumineux ambiant */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-red/15 blur-[120px]" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Store className="h-10 w-10" />
        </div>

        <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
          [ Partenariat B2B ]
        </span>
        <h1 className="mt-2 font-display text-3xl font-light text-white md:text-4xl">
          Devenez Partenaire Professionnel
        </h1>
        <p className="mx-auto mt-3 max-w-lg font-mono text-xs text-neutral-400 leading-relaxed">
          Rejoignez notre réseau de garages, ateliers et revendeurs au Bénin. Soumettez votre demande en un clic pour accéder aux tarifs grossistes sur les motos, tricycles, pièces et lubrifiants.
        </p>

        <ul className="mx-auto mt-8 flex max-w-md flex-col gap-3.5 text-left font-mono text-xs text-neutral-300">
          <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-brand-red shrink-0" />
            <span>Prix dégressifs sur l'ensemble du catalogue</span>
          </li>
          <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-brand-red shrink-0" />
            <span>Livraison prioritaire et dédiée</span>
          </li>
          <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-brand-red shrink-0" />
            <span>Accès privilégié à un interlocuteur dédié</span>
          </li>
        </ul>

        <div className="mt-10 mx-auto max-w-sm">
          <UpgradeB2BButton />
        </div>
      </div>
    </div>
  );
}