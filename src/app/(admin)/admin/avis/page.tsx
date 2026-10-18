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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
          Avis clients
        </h1>
        <p className="mt-1 text-sm text-brand-black/60">
          Modérez les avis : approuvez, masquez ou mettez en vedette.
        </p>
      </div>

      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}