import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommandesPage() {
  const session = await auth();
  
  const orders = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } }
  });

  return (
    <div className="space-y-8">
      {/* EN-TÊTE DE SECTION */}
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red block">
          [ Historique ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light text-white md:text-4xl">
          Mes Commandes
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Suivez l'état d'avancement de vos achats et consultez vos factures.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/40 p-12 text-center backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
            <Package className="h-8 w-8" />
          </div>
          <p className="mt-4 font-display text-xl text-white">
            Aucune commande enregistrée.
          </p>
          <p className="mt-2 font-mono text-xs text-neutral-500">
            Vous n'avez pas encore passé de commande sur notre plateforme.
          </p>
          <Link
            href="/motos"
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-brand-red transition-all duration-300 hover:bg-brand-red hover:text-white"
          >
            <span>Voir le catalogue</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/compte/commandes/${o.id}`}
              className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60"
            >
              {/* En-tête de la carte commande */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-red">
                      Commande #{o.orderNumber}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-neutral-400">
                    {new Date(o.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <p className="font-display text-2xl font-light text-white">
                      {formatPrice(o.total)}
                    </p>
                    <span className="inline-flex mt-1 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-300 backdrop-blur-sm">
                      {o.statut.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 transition-colors group-hover:border-brand-red/50 group-hover:bg-brand-red/10 group-hover:text-brand-red">
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>

              {/* Liste résumée des articles */}
              <ul className="space-y-2.5 font-mono text-xs text-neutral-400">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="truncate block">
                        <strong className="text-white font-sans">{i.quantity}x</strong>{" "}
                        {i.product.name}
                      </span>

                      {/* 🎨 COULEUR SÉLECTIONNÉE */}
                      {i.colorName && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className="h-3 w-3 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: i.colorHex || "#888" }}
                          />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            {i.colorName}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-white font-medium">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}