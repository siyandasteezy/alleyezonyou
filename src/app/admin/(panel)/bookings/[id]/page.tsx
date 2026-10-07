import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/admin-ui";
import { StatusBadge } from "@/components/status-badge";
import { db, schema } from "@/db";
import { duration, formatDateTime, money } from "@/lib/format";
import { localDateString, localTimeString } from "@/lib/time";
import { BookingActions } from "../../booking-actions";
import { RescheduleForm } from "./reschedule-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Booking" };

export default async function BookingDetailPage({ params, searchParams }: PageProps<"/admin/bookings/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, Number(id) || 0),
    with: { customer: true, service: true, stylist: true },
  });
  if (!booking) notFound();

  const stylists = await db
    .select({ id: schema.stylists.id, name: schema.stylists.name })
    .from(schema.stylistServices)
    .innerJoin(schema.stylists, eq(schema.stylists.id, schema.stylistServices.stylistId))
    .where(eq(schema.stylistServices.serviceId, booking.serviceId))
    .orderBy(asc(schema.stylists.sortOrder));

  const editable = booking.status === "pending" || booking.status === "confirmed";

  return (
    <>
      <Link href="/admin/bookings" className="text-sm text-muted hover:text-ink">
        ← All bookings
      </Link>
      <PageHeader title={`Booking ${booking.reference}`}>
        <BookingActions id={booking.id} status={booking.status} showEdit={false} />
      </PageHeader>
      {sp.saved && (
        <p className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          Booking updated and the client has been emailed.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card divide-y divide-line text-sm">
          <Row label="Status" value={<StatusBadge status={booking.status} />} />
          <Row label="When" value={formatDateTime(booking.startsAt)} />
          <Row label="Service" value={`${booking.service.name} · ${duration(booking.service.durationMins)}`} />
          <Row label="Stylist" value={booking.stylist.name} />
          <Row label="Price" value={money(booking.priceCents)} />
          <Row label="Client" value={booking.customer.name} />
          <Row label="Phone" value={<a href={`tel:${booking.customer.phone}`}>{booking.customer.phone}</a>} />
          <Row label="Email" value={<a href={`mailto:${booking.customer.email}`}>{booking.customer.email}</a>} />
          <Row label="Notes" value={booking.notes || "—"} />
          <Row label="Booked" value={formatDateTime(booking.createdAt)} />
        </div>

        {editable && (
          <div className="card p-6">
            <h2 className="mb-4 text-2xl font-semibold">Reschedule</h2>
            <RescheduleForm
              id={booking.id}
              stylists={stylists}
              defaults={{
                stylistId: booking.stylistId,
                date: localDateString(booking.startsAt),
                time: localTimeString(booking.startsAt),
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
