import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, money } from "@/lib/format";
import { site } from "@/lib/site";
import { ClearCartOnArrival } from "./clear-cart";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/order/[ref]">) {
  return (
    <div className="container-x max-w-2xl py-16">
      <Suspense fallback={<p className="text-muted">Loading your order…</p>}>
        <ClearCartOnArrival />
        <OrderDetails params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetails({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.reference, ref),
    with: { items: true, customer: true },
  });
  if (!order) notFound();

  return (
    <>
      <p className="eyebrow mb-3">Order {order.reference}</p>
      <h1 className="text-5xl font-semibold">
        {order.status === "cancelled" ? "Order cancelled" : "Thank you for your order"}
      </h1>
      <p className="mt-4 text-muted">
        Placed {formatDate(order.createdAt)}. A confirmation has been sent to {order.customer.email}.
        {order.status === "pending" && " We'll email you payment details shortly."}
      </p>

      <div className="card mt-8 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Status</span>
          <StatusBadge status={order.status} />
        </div>
        <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span>{money(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
          <p className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{money(order.subtotalCents)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">{order.fulfilment === "pickup" ? "In-store pickup" : "Delivery"}</span>
            <span>{order.deliveryCents ? money(order.deliveryCents) : "Free"}</span>
          </p>
          <p className="flex justify-between pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{money(order.totalCents)}</span>
          </p>
        </div>
        {order.address && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
            Delivering to:{" "}
            {[
              order.address.line1,
              order.address.line2,
              order.address.suburb,
              order.address.city,
              order.address.postalCode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          className="btn-primary"
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, about my order ${order.reference}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          Questions? WhatsApp us
        </a>
        <Link href="/book" className="btn-outline">
          Book an appointment
        </Link>
      </div>
    </>
  );
}
