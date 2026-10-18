import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ReviewsTable } from "@/components/admin/reviews-table";

export const metadata: Metadata = {
  title: "Avis clients | Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAvisPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-8">
      {/* HEADER DE PAGE DARK LUXURY */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
          [ Modération & Témoignages ]
        </span>
        <h1 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-5xl">
          Avis clients
        </h1>
        <p className="mt-2 font-mono text-xs text-neutral-400 max-w-xl leading-relaxed">
          Gérez l'expérience client : approuvez, masquez ou mettez en avant les témoignages de la communauté.
        </p>
      </div>

      {/* TABLEAU ET FILTRES REVISE */}
      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}