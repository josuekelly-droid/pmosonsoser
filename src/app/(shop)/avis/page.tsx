import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import { constructMetadata, siteConfig } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/reviews/review-form";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Avis clients — Témoignages vérifiés",
  description:
    "Découvrez les avis de nos clients sur PM Osons Oser : motos, tricycles, pièces détachées et lubrifiants. Plus de 500 clients satisfaits au Bénin.",
  pathname: "/avis",
});

export default async function AvisPage() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    url: `${siteConfig.url}/avis`,
    image: `${siteConfig.url}/logo/pm-osons-oser-1.jpg`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.createdAt.toISOString(),
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-black pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Témoignages
          </span>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-white sm:text-5xl md:text-6xl">
            Ce que disent nos <span className="text-brand-red">clients</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            {reviews.length} avis vérifiés · Note moyenne{" "}
            <span className="font-semibold text-white">{avg.toFixed(1)}/5</span>{" "}
            sur la base de {reviews.length} témoignages.
          </p>

          {/* Note moyenne visuelle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(avg)
                      ? "h-6 w-6 fill-brand-red text-brand-red"
                      : "h-6 w-6 text-white/20"
                  }
                />
              ))}
            </div>
            <span className="font-display text-3xl text-white">
              {avg.toFixed(1)}
            </span>
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section
        id="laisser-un-avis"
        className="scroll-mt-24 bg-brand-black py-16 md:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
              Laissez votre <span className="text-brand-red">avis</span>
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Votre témoignage aide d'autres clients à faire le bon choix.
            </p>
          </div>
          <ReviewForm />
        </div>
      </section>

      {/* Liste complète */}
      <section className="bg-brand-gray py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="font-display text-3xl tracking-wide text-brand-black md:text-4xl">
            Tous les avis
          </h2>
          <p className="mt-2 text-brand-black/60">
            {reviews.length} témoignages vérifiés
          </p>

          {reviews.length === 0 ? (
            <p className="mt-10 text-brand-black/50">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience !
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="relative flex flex-col rounded-2xl border border-brand-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Quote className="absolute right-5 top-5 h-7 w-7 text-brand-red/15" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating
                            ? "h-4 w-4 fill-brand-red text-brand-red"
                            : "h-4 w-4 text-brand-black/15"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-black/80">
                    "{r.text}"
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-brand-black/5 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 font-display text-base text-brand-red">
                      {r.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-black">
                        {r.name}
                      </p>
                      <p className="truncate text-xs text-brand-black/50">
                        {r.role}
                        {r.city ? ` · ${r.city}` : ""}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}