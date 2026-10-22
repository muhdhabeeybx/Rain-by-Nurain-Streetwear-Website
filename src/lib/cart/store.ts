"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addLine, type CartLine, setLineQuantity } from "./lines";

/** sessionStorage key: the order this browser just sent to Paystack. */
export const PENDING_ORDER_KEY = "rbn-pending-order";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity: number, available: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setOpen: (isOpen: boolean) => void;
  /** Refreshes saved names, prices and images from a live quote. */
  refresh: (
    live: Pick<CartLine, "variantId" | "name" | "colorName" | "price" | "imagePath" | "slug">[],
  ) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity, available) =>
        set((state) => ({ lines: addLine(state.lines, line, quantity, available), isOpen: true })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({ lines: setLineQuantity(state.lines, variantId, quantity) })),
      remove: (variantId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      setOpen: (isOpen) => set({ isOpen }),
      refresh: (live) =>
        set((state) => ({
          lines: state.lines.map((line) => {
            const match = live.find((item) => item.variantId === line.variantId);
            return match ? { ...line, ...match } : line;
          }),
        })),
    }),
    {
      name: "rbn-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Rehydrated by <CartSync /> after mount so server and client HTML match.
      skipHydration: true,
    },
  ),
);

/** False until the saved bag has been loaded from this browser. */
export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
