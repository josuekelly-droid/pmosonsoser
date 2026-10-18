import Link from "next/link";
import { Package, Clock, CheckCircle2, ArrowRight, Crown } from "lucide-react";
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

  // Calcul des économies pour les Pros (différence entre prix public et prix payé)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black">
          Bonjour, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Voici un résumé de votre activité chez PM Osons Oser.
        </p>
      </div>

      {/* Bannière Pro (visible uniquement si validé) */}
      {isProValidated && (
        <ProBanner savingsTotal={savingsTotal} proOrdersCount={totalOrders} />
      )}

      {/* Bannière invitation B2B (visible si client B2C) */}
      {user?.typeCompte === "B2C" && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-brand-black/5 bg-white p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-black">Devenez Professionnel</p>
              <p className="text-xs text-brand-black/60">Accédez à des prix dégressifs sur tout le catalogue.</p>
            </div>
          </div>
          <Link
            href="/compte/devenir-pro"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-red/90"
          >
            Faire la demande <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-black/5 bg-white p-5">
          <Package className="h-5 w-5 text-brand-black/40" />
          <p className="mt-3 font-display text-3xl text-brand-black">{totalOrders}</p>
          <p className="text-xs text-brand-black/50">Commandes totales</p>
        </div>
        <div className="rounded-2xl border border-brand-black/5 bg-white p-5">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="mt-3 font-display text-3xl text-brand-black">{pending}</p>
          <p className="text-xs text-brand-black/50">En attente de paiement</p>
        </div>
        <div className="rounded-2xl border border-brand-black/5 bg-white p-5">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="mt-3 font-display text-3xl text-brand-black">{delivered}</p>
          <p className="text-xs text-brand-black/50">Livrées</p>
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="rounded-3xl border border-brand-black/5 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-brand-black">Dernières commandes</h2>
          <Link href="/compte/commandes" className="text-sm font-semibold text-brand-red hover:underline">
            Tout voir
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <p className="text-sm text-brand-black/50">Aucune commande passée pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <Link key={o.id} href={`/compte/commandes/${o.id}`} className="flex items-center justify-between rounded-xl border border-brand-black/5 p-4 hover:bg-brand-gray/50 transition">
                <div>
                  <p className="font-semibold text-brand-black">{o.orderNumber}</p>
                  <p className="text-xs text-brand-black/50">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-brand-red">{formatPrice(o.total)}</p>
                  <p className="text-[10px] font-bold uppercase text-brand-black/50">{o.statut.replace("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}