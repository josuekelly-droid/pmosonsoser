import Link from "next/link";
import { Star, Quote, ArrowUpRight } from "lucide-react";
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
    <article className="group relative flex w-[340px] shrink-0 flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/40 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-red/40 hover:bg-neutral-900/80 hover:shadow-[0_15px_30px_rgba(239,68,68,0.1)] md:w-[380px]">
      <Quote className="absolute right-6 top-6 h-8 w-8 text-brand-red/15 transition-transform duration-500 group-hover:scale-110 group-hover:text-brand-red/30" />

      <div>
        {/* Étoiles */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={
                idx < rating
                  ? "h-3.5 w-3.5 fill-brand-red text-brand-red"
                  : "h-3.5 w-3.5 text-white/15"
              }
            />
          ))}
        </div>

        {/* Texte du témoignage */}
        <p className="mt-5 line-clamp-4 text-sm font-light leading-relaxed text-neutral-300">
          &ldquo;{text}&rdquo;
        </p>
      </div>

      {/* Auteur */}
      <div className="mt-8 flex items-center gap-3.5 border-t border-white/10 pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/10 font-display text-base font-semibold text-brand-red shadow-inner">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="truncate font-mono text-[11px] text-neutral-400">
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
  const doubled = [...reviews, ...reviews];

  return (
    <div className="relative flex overflow-hidden py-2">
      <div
        className={`flex gap-6 ${
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

  const mid = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, mid);
  const row2 = reviews.slice(mid);

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-brand-black py-28 md:py-40 selection:bg-brand-red selection:text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-red/15 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-red">
            [ Témoignages & Confiance ]
          </span>
          <h2 className="mt-4 font-display text-4xl font-extralight tracking-tight text-white md:text-6xl">
            Ce que disent nos <span className="italic font-serif font-normal text-brand-red">partenaires</span>
          </h2>
          <p className="mt-4 text-base text-neutral-400 md:text-lg">
            Plus de 500 clients et professionnels au Bénin recommandent notre exigence de qualité, notre rapidité de livraison et notre service client.
          </p>
        </div>
      </div>

      {/* Marquee 2 rangées avec masques de fondu */}
      <div className="relative mt-16 space-y-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent md:w-52" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-black via-brand-black/80 to-transparent md:w-52" />

        <Row reviews={row1} />
        <Row reviews={row2} reverse />
      </div>

      {/* CTAs Bas de section */}
      <div className="relative mx-auto mt-16 flex max-w-7xl flex-col items-center gap-4 px-6 text-center lg:px-12">
        <Link
          href="/avis"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-500 hover:border-brand-red hover:bg-brand-red hover:text-white"
        >
          <span>Lire l'ensemble des avis clients</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
        </Link>
        <Link
          href="/avis#laisser-un-avis"
          className="font-mono text-xs text-neutral-400 transition-colors duration-300 hover:text-white"
        >
          Vous avez commandé ? <span className="text-brand-red underline underline-offset-4">Laisser votre avis →</span>
        </Link>
      </div>
    </section>
  );
}