import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommandesPage() {
  const session = await auth();
  
  const orders = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-brand-black">Mes commandes</h1>
      
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-brand-black/5 bg-white p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-brand-black/20" />
          <p className="mt-4 text-sm text-brand-black/50">Vous n'avez pas encore passé de commande.</p>
          <Link href="/motos" className="mt-4 inline-flex items-center gap-2 text-brand-red font-semibold hover:underline">
            Voir le catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="rounded-2xl border border-brand-black/5 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-black/5 pb-4 mb-4">
                <div>
                  <p className="font-display text-lg text-brand-black">{o.orderNumber}</p>
                  <p className="text-xs text-brand-black/50">{new Date(o.createdAt).toLocaleString("fr-FR")}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-display text-xl text-brand-red">{formatPrice(o.total)}</p>
                  <span className="inline-flex mt-1 rounded-full bg-brand-gray px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-black/60">
                    {o.statut.replace("_", " ")}
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {o.items.map(i => (
                  <li key={i.id} className="flex justify-between text-sm text-brand-black/70">
                    <span>{i.quantity}x {i.product.name}</span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}