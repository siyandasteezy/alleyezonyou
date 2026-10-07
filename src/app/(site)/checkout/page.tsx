"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useCart } from "@/components/cart";
import type { FormState } from "@/lib/customers";
import { money } from "@/lib/format";
import { deliveryFee, type Fulfilment } from "@/lib/shop";
import { site } from "@/lib/site";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { items, subtotalCents, ready } = useCart();
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [state, submit, pending] = useActionState<FormState, FormData>(placeOrder, {});
  const fee = deliveryFee(subtotalCents, fulfilment);
  const err = (name: string) => state.fieldErrors?.[name]?.[0];

  if (ready && items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-4xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="mb-8 text-5xl font-semibold">Checkout</h1>
      <form action={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.map(({ productId, quantity }) => ({ productId, quantity })))}
        />
        <input type="hidden" name="fulfilment" value={fulfilment} />

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-5 text-2xl font-semibold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" autoComplete="name" error={err("name")} />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" error={err("phone")} />
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                error={err("email")}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-5 text-2xl font-semibold">Delivery or pickup</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Option
                checked={fulfilment === "delivery"}
                onSelect={() => setFulfilment("delivery")}
                title="Deliver to me"
                detail={subtotalCents >= site.freeDeliveryFromCents ? "Free" : money(site.deliveryFeeCents)}
              />
              <Option
                checked={fulfilment === "pickup"}
                onSelect={() => setFulfilment("pickup")}
                title="Collect in-store"
                detail={`Free · ${site.address.suburb}`}
              />
            </div>
            {fulfilment === "delivery" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Street address"
                  name="line1"
                  autoComplete="address-line1"
                  error={err("line1")}
                  className="sm:col-span-2"
                />
                <Field
                  label="Apartment, complex (optional)"
                  name="line2"
                  autoComplete="address-line2"
                  required={false}
                  className="sm:col-span-2"
                />
                <Field label="Suburb" name="suburb" autoComplete="address-level3" error={err("suburb")} />
                <Field label="City" name="city" autoComplete="address-level2" error={err("city")} />
                <Field
                  label="Postal code"
                  name="postalCode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  error={err("postalCode")}
                />
              </div>
            )}
          </section>

          <section className="card p-6">
            <h2 className="mb-3 text-2xl font-semibold">Payment</h2>
            {/* TODO: replace with PayFast/Yoco hosted checkout once the spa's merchant account is set up. */}
            <p className="text-sm text-muted">
              Place your order now and we&apos;ll send payment details by email. Orders are dispatched (or ready for
              collection) once payment is received.
            </p>
            <label className="label mt-5" htmlFor="notes">
              Order notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea id="notes" name="notes" rows={2} className="input" />
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span>{money(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <p className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{money(subtotalCents)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">{fulfilment === "pickup" ? "Pickup" : "Delivery"}</span>
              <span>{fee ? money(fee) : "Free"}</span>
            </p>
            <p className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{money(subtotalCents + fee)}</span>
            </p>
          </div>
          {(state.error || state.fieldErrors?.items) && (
            <p className="mt-4 text-sm text-danger">{state.error ?? state.fieldErrors?.items?.[0]}</p>
          )}
          <button className="btn-primary mt-6 w-full py-3 text-base" disabled={pending || !ready}>
            {pending ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Option({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition ${checked ? "border-accent ring-2 ring-accent/20" : "border-line hover:border-ink"}`}
    >
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted">{detail}</p>
    </button>
  );
}

function Field({
  label,
  name,
  error,
  className = "",
  required = true,
  ...rest
}: { label: string; name: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} required={required} className="input" {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
