"use client";

import { useState } from "react";
import { ColorSelector } from "./color-selector";
import { AddToCart } from "./add-to-cart";

type Color = { id: string; name: string; hex: string };

export function ProductPurchaseBlock({
  product,
  colors,
}: {
  product: {
    id: string;
    name: string;
    priceB2C: number;
    images: string[];
    stock: number;
  };
  colors: Color[];
}) {
  // Pré-sélectionne la première couleur par défaut
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colors[0]?.id || null
  );

  const selectedColor = colors.find((c) => c.id === selectedColorId) || null;

  return (
    <>
      {colors.length > 0 && (
        <ColorSelector
          colors={colors}
          selectedId={selectedColorId}
          onSelectAction={setSelectedColorId}
        />
      )}

      <div className="mt-9">
        <AddToCart
          product={product}
          selectedColor={selectedColor}
          requiresColor={colors.length > 0}
        />
      </div>
    </>
  );
}