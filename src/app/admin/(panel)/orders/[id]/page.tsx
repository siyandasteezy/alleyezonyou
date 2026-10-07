import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/admin-ui";
import { SubmitButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/status-badge";
import { db, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import { formatDateTime, money } from "@/lib/format";
import { setOrderStatus } from "../../../actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, Number(id) || 0),
    with: { customer: true, items: true },
  });
  if (!order) notFound();

  const next: { status: OrderStatus; label: string; primary?: boolean }[] = (
    {
      pending: [{ status: "paid", label: "Mark as paid", primary: true }],
      paid:
        order.fulfilment === "pickup"
          ? [{ status: "ready", label: "Ready for pickup", primary: true }]
          : [{ status: "shipped", label: "Mark as shipped", primary: true }],
      ready: [{ status: "completed", label: "Collected", primary: true }],
      shipped: [{ status: "completed", label: "Delivered", primary: true }],
      completed: [],
      cancelled: [],
    } as Record<OrderStatus, { status: OrderStatus; label: string; primary?: boolean }[]>
  )[order.status];

  const cancellable = ["pending", "paid", "ready"].includes(order.status);

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-ink">
        ← All orders
      </Link>
      <PageHeader title={`Order ${order.reference}`}>
        {next.map((n) => (
          <form key={n.status} action={setOrderStatus.bind(null, order.id, n.status)}>
            <SubmitButton className={n.primary ? "btn-primary" : "btn-outline"}>{n.label}</SubmitButton>
          </form>
        ))}
        {cancellable && (
          <form action={setOrderStatus.bind(null, order.id, "cancelled")}>
            <SubmitButton
              className="btn-ghost text-danger"
              confirm="Cancel this order? Stock will be returned and the customer emailed."
            >
              Cancel order
            </SubmitButton>
          </form>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Items</h2>
            <StatusBadge status={order.status} />
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-2.5">
                <span>
                  {i.quantity} × {i.name} <span className="text-muted">@ {money(i.unitPriceCents)}</span>
                </span>
                <span className="font-medium">{money(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-line pt-3 text-sm">
            <p className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              {money(order.subtotalCents)}
            </p>
            <p className="flex justify-between">
              <span className="text-muted">Delivery</span>
              {money(order.deliveryCents)}
            </p>
            <p className="flex justify-between text-base font-semibold">
              <span>Total</span>
              {money(order.totalCents)}
            </p>
          </div>
          {order.notes && <p className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">Note: {order.notes}</p>}
        </div>

        <div className="card space-y-4 p-6 text-sm">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Customer</h2>
            <p className="font-medium">{order.customer.name}</p>
            <p>
              <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
            </p>
            <p>
              <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-xl font-semibold">
              {order.fulfilment === "pickup" ? "In-store pickup" : "Delivery address"}
            </h2>
            {order.address ? (
              <p className="text-muted">
                {order.address.line1}
                {order.address.line2 && <>, {order.address.line2}</>}
                <br />
                {order.address.suburb}, {order.address.city}, {order.address.postalCode}
              </p>
            ) : (
              <p className="text-muted">Customer will collect from the spa.</p>
            )}
          </div>
          <p className="text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
      </div>
    </>
  );
}
