"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  brandName: string;
};

export function ProductGallery({ images, alt, brandName }: Props) {
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 backdrop-blur-xl">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-950 via-black to-brand-red/20">
          <span className="font-display text-8xl font-extralight tracking-widest text-white/20">
            {brandName.toUpperCase().slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* CADRE IMAGE PRINCIPALE */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-xl transition-all duration-700 hover:border-white/20">
        {/* Glow ambient de fond */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-[120px] transition-opacity duration-700 group-hover:opacity-100 opacity-60" />

        {/* Badge de vue active HUD */}
        <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/80 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-neutral-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
          <span>{brandName}</span>
          <span className="text-neutral-600">|</span>
          <span className="text-white">
            {active + 1 < 10 ? `0${active + 1}` : active + 1} / {images.length < 10 ? `0${images.length}` : images.length}
          </span>
        </div>

        {/* Image affichée */}
        <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-4"
            priority
          />
        </div>
      </div>

      {/* MINIATURES */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, i) => {
            const isActive = active === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Afficher l'image ${i + 1}`}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border p-2 backdrop-blur-xl transition-all duration-300",
                  isActive
                    ? "border-brand-red bg-brand-red/10 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105"
                    : "border-white/10 bg-neutral-900/40 hover:border-white/30 hover:bg-neutral-900/80"
                )}
              >
                <Image
                  src={img}
                  alt={`${alt} vue ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}