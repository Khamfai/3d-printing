"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, PrintQuality } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.modelId === item.modelId &&
              i.materialId === item.materialId &&
              i.colorHex === item.colorHex &&
              i.quality === item.quality &&
              i.infillPercent === item.infillPercent
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      setDrawerOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "3d-printing-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selectors
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
