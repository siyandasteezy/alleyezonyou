"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart";
import { QuantityInput } from "@/components/quantity-input";

export function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { add, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.productId === product.productId)?.quantity ?? 0;
  const available = product.maxQuantity - inCart;

  if (product.maxQuantity <= 0) {
    return (
      <button className="btn-primary w-full py-3 text-base sm:w-auto" disabled>
        Out of stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityInput value={quantity} max={Math.max(available, 1)} onChange={setQuantity} />
        <button
          type="button"
          className="btn-primary flex-1 py-3 text-base sm:flex-none sm:px-10"
          disabled={available <= 0}
          onClick={() => {
            add(product, quantity);
            setAdded(true);
            setQuantity(1);
          }}
        >
          {available <= 0 ? "All stock in your cart" : "Add to cart"}
        </button>
      </div>
      {added && (
        <p className="text-sm text-success">
          Added to your cart.{" "}
          <Link href="/cart" className="font-semibold underline">
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
