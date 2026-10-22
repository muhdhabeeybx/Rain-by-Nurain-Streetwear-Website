"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PENDING_ORDER_KEY, useCart } from "@/lib/cart/store";

/** Empties the bag once the order this browser just placed has gone through. */
export function ClearBagForOrder({ orderNumber }: { orderNumber: string }) {
  const clear = useCart((state) => state.clear);
  useEffect(() => {
    if (sessionStorage.getItem(PENDING_ORDER_KEY) === orderNumber) {
      clear();
      sessionStorage.removeItem(PENDING_ORDER_KEY);
    }
  }, [clear, orderNumber]);
  return null;
}

/** Re-checks a pending payment every few seconds for up to two minutes. */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 120_000) clearInterval(timer);
      else router.refresh();
    }, 4_000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
