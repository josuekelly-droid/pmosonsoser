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
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-black to-brand-red/30">
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-8xl tracking-wider text-white/30">
            {brandName.toUpperCase().slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-brand-black/5 bg-white">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
          priority
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition",
                active === i
                  ? "border-brand-red"
                  : "border-brand-black/5 hover:border-brand-black/20"
              )}
            >
              <Image
                src={img}
                alt={`${alt} - vue ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}