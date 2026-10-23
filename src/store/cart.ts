import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;        // cartKey = `${productId}-${colorId || "default"}`
  productId: string; // pour l'API
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
  colorId?: string;
  colorName?: string;
  colorHex?: string;
};

type CartState = {
  items: CartItem[];
  add: (
    item: Omit<CartItem, "id" | "quantity">,
    quantity?: number
  ) => void;
  remove: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;
};

function makeCartKey(productId: string, colorId?: string) {
  return `${productId}::${colorId || "default"}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (item, quantity = 1) =>
        set((state) => {
          const cartKey = makeCartKey(item.productId, item.colorId);
          const existing = state.items.find((i) => i.id === cartKey);

          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, item.stock);
            return {
              items: state.items.map((i) =>
                i.id === cartKey ? { ...i, quantity: newQty } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id: cartKey,
                quantity: Math.min(quantity, item.stock),
              },
            ],
          };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "pm-osons-cart-v2" } // invalider l'ancien cache
  )
);