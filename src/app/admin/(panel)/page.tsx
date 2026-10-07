import Link from "next/link";
import { and, asc, count, desc, gte, inArray, lt, lte } from "drizzle-orm";
import { PageHeader, Stat, Table, Td } from "@/components/admin-ui";
import { StatusBadge } from "@/components/status-badge";
import { LOW_STOCK } from "@/components/stock-badge";
import { db, schema } from "@/db";
import { formatDate, formatTime, money } from "@/lib/format";
import { addDays, localDateString, toInstant } from "@/lib/time";
import { BookingActions } from "./booking-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  await requireAdmin();
  const today = localDateString();
  const dayStart = toInstant(today, "00:00");
  const dayEnd = toInstant(addDays(today, 1), "00:00");

  const [todays, [{ pending }], [{ openOrders }], [{ lowStock }], recentOrders] = await Promise.all([
    db.query.bookings.findMany({
      where: and(
        gte(schema.bookings.startsAt, dayStart),
        lt(schema.bookings.startsAt, dayEnd),
        inArray(schema.bookings.status, ["pending", "confirmed", "completed"]),
      ),
      with: { customer: true, service: true, stylist: true },
      orderBy: asc(schema.bookings.startsAt),
    }),
    db
      .select({ pending: count() })
      .from(schema.bookings)
      .where(and(inArray(schema.bookings.status, ["pending"]), gte(schema.bookings.startsAt, dayStart))),
    db
      .select({ openOrders: count() })
      .from(schema.orders)
      .where(inArray(schema.orders.status, ["pending", "paid", "ready"])),
    db.select({ lowStock: count() }).from(schema.products).where(lte(schema.products.stock, LOW_STOCK)),
    db.query.orders.findMany({ with: { customer: true }, orderBy: desc(schema.orders.createdAt), limit: 5 }),
  ]);

  return (
    <>
      <PageHeader title="Overview">
        <span className="text-sm text-muted">{formatDate(dayStart, { weekday: "long", month: "long" })}</span>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Appointments today" value={todays.length} href="/admin/bookings?view=today" />
        <Stat label="Awaiting confirmation" value={pending} href="/admin/bookings?status=pending" />
        <Stat label="Open orders" value={openOrders} href="/admin/orders?status=open" />
        <Stat label="Low / out of stock" value={lowStock} href="/admin/products?stock=low" />
      </div>

      <h2 className="mt-10 mb-3 text-2xl font-semibold">Today&apos;s schedule</h2>
      <Table head={["Time", "Client", "Service", "Stylist", "Status", ""]} empty="No appointments today.">
        {todays.map((b) => (
          <tr key={b.id}>
            <Td className="font-medium whitespace-nowrap">
              {formatTime(b.startsAt)}–{formatTime(b.endsAt)}
            </Td>
            <Td>
              <p className="font-medium">{b.customer.name}</p>
              <p className="text-xs text-muted">{b.customer.phone}</p>
            </Td>
            <Td>{b.service.name}</Td>
            <Td>{b.stylist.name}</Td>
            <Td>
              <StatusBadge status={b.status} />
            </Td>
            <Td>
              <BookingActions id={b.id} status={b.status} />
            </Td>
          </tr>
        ))}
      </Table>

      <div className="mt-10 mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recent orders</h2>
        <Link href="/admin/orders" className="text-sm font-medium text-accent">
          All orders →
        </Link>
      </div>
      <Table head={["Order", "Customer", "Total", "Fulfilment", "Status"]} empty="No orders yet.">
        {recentOrders.map((o) => (
          <tr key={o.id}>
            <Td>
              <Link href={`/admin/orders/${o.id}`} className="font-medium text-accent hover:underline">
                {o.reference}
              </Link>
              <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
            </Td>
            <Td>{o.customer.name}</Td>
            <Td>{money(o.totalCents)}</Td>
            <Td className="capitalize">{o.fulfilment}</Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
