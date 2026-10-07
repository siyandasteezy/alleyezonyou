"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { PlaceholderImage } from "@/components/placeholder-image";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { QuantityInput } from "@/components/quantity-input";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, remove, ready } = useCart();

  return (
    <div className="container-x py-12">
      <h1 className="mb-8 text-5xl font-semibold">Your cart</h1>
      {!ready ? null : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-6">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="card divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/shop/${item.slug}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line sm:h-24 sm:w-24"
                >
                  <PlaceholderImage src={item.image} alt={item.name} label="" />
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="font-medium hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted">{money(item.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantityInput
                      value={item.quantity}
                      max={item.maxQuantity}
                      onChange={(n) => setQuantity(item.productId, n)}
                    />
                    <p className="w-24 text-right font-medium">{money(item.priceCents * item.quantity)}</p>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="text-sm text-muted hover:text-danger"
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="card h-fit p-6">
            <h2 className="text-2xl font-semibold">Summary</h2>
            <p className="mt-4 flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{money(subtotalCents)}</span>
            </p>
            <p className="mt-2 text-xs text-muted">
              Delivery {money(site.deliveryFeeCents)}, free over {money(site.freeDeliveryFromCents)}. In-store pickup is
              free.
            </p>
            <Link href="/checkout" className="btn-primary mt-6 w-full py-3 text-base">
              Checkout
            </Link>
            <Link href="/shop" className="btn-ghost mt-2 w-full">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
