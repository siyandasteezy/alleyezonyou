"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/components/cart";

/** Empties the cart after a successful checkout redirect (?new=1), then drops the flag. */
export function ClearCartOnArrival() {
  const params = useSearchParams();
  const router = useRouter();
  const { clear, ready } = useCart();
  const isNew = params.get("new") === "1";

  useEffect(() => {
    if (!isNew || !ready) return;
    clear();
    router.replace(window.location.pathname, { scroll: false });
  }, [isNew, ready, clear, router]);

  return null;
}
