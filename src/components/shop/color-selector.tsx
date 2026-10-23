"use client";

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type Color = { id: string; name: string; hex: string };

export function ColorSelector({
  colors,
  selectedId,
  onSelectAction, // ⬅️ Renommé
}: {
  colors: Color[];
  selectedId: string | null;
  onSelectAction: (id: string) => void; // ⬅️ Renommé
}) {
  if (colors.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white">
        <Palette className="h-4 w-4 text-brand-red" />
        Choisir une couleur
      </h2>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const active = selectedId === color.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelectAction(color.id)} // ⬅️ Renommé
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-md transition-all",
                active
                  ? "border-brand-red bg-brand-red/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "border-white/10 bg-black/40 hover:border-white/30"
              )}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full border-2",
                  active ? "border-white" : "border-white/20"
                )}
                style={{ backgroundColor: color.hex }}
              />
              <span
                className={cn(
                  "font-mono text-xs",
                  active ? "text-white font-semibold" : "text-neutral-300"
                )}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}