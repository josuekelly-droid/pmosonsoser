"use client";

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type Color = { id: string; name: string; hex: string };

export function ColorPicker({
  colors,
  selectedIds,
  onChangeAction,
}: {
  colors: Color[];
  selectedIds: string[];
  onChangeAction: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChangeAction(selectedIds.filter((i) => i !== id));
    } else {
      onChangeAction([...selectedIds, id]);
    }
  }

  if (colors.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-400">
        <Palette className="h-4 w-4" />
        Aucune couleur dans la palette. Créez-en dans /admin/couleurs.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const selected = selectedIds.includes(color.id);
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => toggle(color.id)}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                selected
                  ? "border-brand-red bg-brand-red/10 text-white"
                  : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/30"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border",
                  selected ? "border-white/50" : "border-white/20"
                )}
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono text-[11px]">{color.name}</span>
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-neutral-500">
          {selectedIds.length} couleur{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}