import Link from "next/link";
import { Package, Clock, CheckCircle2, Crown, ArrowUpRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProBanner } from "@/components/client/pro-banner";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { typeCompte: true, statutValidation: true },
  });

  const isProValidated = 
    user?.statutValidation === "VALIDE" && 
    (user?.typeCompte === "B2B" || user?.typeCompte === "PREMIUM");

  const [orders, stats] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.groupBy({
      by: ['statut'],
      where: { userId: session?.user?.id },
      _count: true,
    })
  ]);

  const totalOrders = stats.reduce((acc, s) => acc + s._count, 0);
  const pending = stats.find(s => s.statut === 'EN_ATTENTE')?._count || 0;
  const delivered = stats.find(s => s.statut === 'LIVRE')?._count || 0;

  // Calcul des économies pour les Pros
  let savingsTotal = 0;
  if (isProValidated) {
    const allOrdersWithItems = await prisma.order.findMany({
      where: { 
        userId: session?.user?.id,
        statut: { in: ["PAYE", "EXPEDIE", "LIVRE"] }
      },
      include: { items: { include: { product: true } } },
    });

    for (const order of allOrdersWithItems) {
      for (const item of order.items) {
        const publicPrice = item.product.priceB2C;
        const paidPrice = item.price;
        if (publicPrice > paidPrice) {
          savingsTotal += (publicPrice - paidPrice) * item.quantity;
        }
      }
    }
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Client";

  return (
    <div className="space-y-8 text-white">
      {/* EN-TÊTE D'ACCUEIL */}
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
          [ Tableau de Bord ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light text-white md:text-4xl">
          Bonjour, {firstName} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Voici un résumé en temps réel de votre activité chez PM Osons Oser.
        </p>
      </div>

      {/* BANNIÈRE PRO (Visible uniquement si validé) */}
      {isProValidated && (
        <ProBanner savingsTotal={savingsTotal} proOrdersCount={totalOrders} />
      )}

      {/* BANNIÈRE INVITATION B2B (Visible si client B2C) */}
      {user?.typeCompte === "B2C" && (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-red/30 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-red/10 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 text-brand-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-red">
                [ Opportunité B2B ]
              </span>
              <p className="font-display text-xl font-light text-white">Devenez Professionnel</p>
              <p className="font-mono text-xs text-neutral-400">Accédez à des prix de gros dégressifs sur l'ensemble du catalogue.</p>
            </div>
          </div>

          <Link
            href="/compte/devenir-pro"
            className="group relative z-10 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-brand-red/25 transition-all duration-300 hover:bg-white hover:text-black"
          >
            <span>Faire la demande</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      )}

      {/* STATISTIQUES HUD */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-neutral-400">
            <Package className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-3xl font-light text-white">{totalOrders}</p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Commandes totales</span>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-3xl font-light text-white">{pending}</p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">En attente / traitement</span>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-3xl font-light text-white">{delivered}</p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Commandes livrées</span>
        </div>
      </div>

      {/* DERNIÈRES COMMANDES */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl md:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red">
              [ Activité récente ]
            </span>
            <h2 className="mt-1 font-display text-2xl font-light text-white">Dernières commandes</h2>
          </div>
          <Link
            href="/compte/commandes"
            className="group inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
          >
            <span>Tout voir</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <p className="font-mono text-xs text-neutral-400 py-4 text-center">Aucune commande passée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/compte/commandes/${o.id}`}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md transition-all duration-300 hover:border-brand-red/50 hover:bg-black/50"
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-white group-hover:text-brand-red transition-colors">
                    #{o.orderNumber}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-light text-white">
                    {formatPrice(o.total)}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {o.statut.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}