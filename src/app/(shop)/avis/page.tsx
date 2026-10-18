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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0B] text-white">
      {/* Balise de données structurées SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Éléments de fond décoratifs Dark Luxury */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
      <div className="absolute left-1/2 top-1/4 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[160px] pointer-events-none" />

      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
            [ Témoignages ]
          </span>
          <h1 className="mt-3 font-display text-4xl font-light tracking-wide text-white sm:text-5xl md:text-6xl">
            Ce que disent nos <span className="italic font-serif text-brand-red">clients</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-mono text-xs md:text-sm text-neutral-400">
            {reviews.length} avis vérifiés · Note moyenne{" "}
            <span className="font-semibold text-white">{avg.toFixed(1)}/5</span>{" "}
            sur la base de nos derniers témoignages.
          </p>

          {/* Note moyenne visuelle */}
          <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-white/10 bg-neutral-900/40 px-6 py-3 backdrop-blur-2xl">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(avg)
                      ? "h-5 w-5 fill-brand-red text-brand-red"
                      : "h-5 w-5 text-white/20"
                  }
                />
              ))}
            </div>
            <span className="font-display text-2xl font-light text-white">
              {avg.toFixed(1)}<span className="text-xs font-mono text-neutral-500">/5</span>
            </span>
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section
        id="laisser-un-avis"
        className="scroll-mt-28 py-16 md:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl md:p-12">
            <div className="mb-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                [ Contribution ]
              </span>
              <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
                Laissez votre <span className="italic font-serif text-brand-red">avis</span>
              </h2>
              <p className="mt-2 font-mono text-xs text-neutral-400">
                Votre témoignage aide d'autres passionnés et professionnels à faire le bon choix.
              </p>
            </div>
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* LISTE COMPLÈTE DES AVIS */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-red">
                [ Retours d'expérience ]
              </span>
              <h2 className="mt-1 font-display text-3xl font-light tracking-wide text-white md:text-4xl">
                Tous les avis
              </h2>
            </div>
            <p className="font-mono text-xs text-neutral-400">
              {reviews.length} témoignages vérifiés
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-neutral-900/40 p-12 text-center backdrop-blur-2xl">
              <p className="font-mono text-xs text-neutral-400">
                Aucun avis pour le moment. Soyez le premier à partager votre expérience !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-2xl transition-all duration-300 hover:border-brand-red/50 hover:bg-neutral-900/60"
                >
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-white/5 transition-colors group-hover:text-brand-red/10" />
                  
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating
                              ? "h-4 w-4 fill-brand-red text-brand-red"
                              : "h-4 w-4 text-white/20"
                          }
                        />
                      ))}
                    </div>
                    <p className="font-mono text-xs leading-relaxed text-neutral-300">
                      « {r.text} »
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-3.5 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-red/30 bg-brand-red/10 font-display text-lg text-brand-red shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      {r.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-medium text-white">
                        {r.name}
                      </p>
                      <p className="truncate font-mono text-[11px] text-neutral-400">
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
    </div>
  );
}