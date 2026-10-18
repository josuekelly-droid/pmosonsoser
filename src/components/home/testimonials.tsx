import Link from "next/link";
import { Star, Quote, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

function ReviewCard({
  name,
  role,
  city,
  rating,
  text,
}: {
  name: string;
  role: string | null;
  city: string | null;
  rating: number;
  text: string;
}) {
  return (
    <article className="relative flex w-[320px] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-brand-red/30 hover:bg-white/[0.07] md:w-[360px]">
      <Quote className="absolute right-4 top-4 h-7 w-7 text-brand-red/20" />

      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={
              idx < rating
                ? "h-4 w-4 fill-brand-red text-brand-red"
                : "h-4 w-4 text-white/20"
            }
          />
        ))}
      </div>

      <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-white/80">
        "{text}"
      </p>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/20 font-display text-base text-brand-red">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-white/50">
            {role}
            {city ? ` · ${city}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

function Row({
  reviews,
  reverse = false,
}: {
  reviews: Array<{
    id: string;
    name: string;
    role: string | null;
    city: string | null;
    rating: number;
    text: string;
  }>;
  reverse?: boolean;
}) {
  // On duplique la liste pour un défilement continu
  const doubled = [...reviews, ...reviews];

  return (
    <div className="marquee-container relative flex overflow-hidden">
      <div
        className={`flex gap-4 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} {...r} />
        ))}
      </div>
    </div>
  );
}

export async function Testimonials() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      rating: true,
      text: true,
    },
  });

  if (reviews.length === 0) return null;

  // Split en 2 rangées
  const mid = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, mid);
  const row2 = reviews.slice(mid);

  return (
    <section className="relative overflow-hidden bg-brand-black py-20 md:py-28">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">
            Témoignages
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-wide text-white md:text-5xl">
            Ils nous font <span className="text-brand-red">confiance</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Plus de 500 clients satisfaits au Bénin nous recommandent pour la qualité,
            la rapidité et la fiabilité.
          </p>
        </div>
      </div>

      {/* Marquee 2 rangées */}
      <div className="relative mt-14 space-y-4">
        {/* Masques dégradés sur les bords */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-brand-black to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-brand-black to-transparent md:w-40" />

        <Row reviews={row1} />
        <Row reviews={row2} reverse />
      </div>

      <div className="relative mx-auto mt-14 flex max-w-7xl flex-col items-center gap-4 px-4 md:px-8">
        <Link
          href="/avis"
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-brand-red hover:border-brand-red"
        >
          Lire tous les avis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/avis#laisser-un-avis"
          className="text-sm text-brand-red hover:text-white transition"
        >
          Laisser mon avis →
        </Link>
      </div>
    </section>
  );
}