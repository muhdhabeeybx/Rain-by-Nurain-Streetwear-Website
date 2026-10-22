"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";

/** Loads the saved bag after hydration and keeps open tabs in sync. */
export function CartSync() {
  useEffect(() => {
    void useCart.persist.rehydrate();

    const onStorage = (event: StorageEvent) => {
      if (event.key === useCart.persist.getOptions().name) void useCart.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
