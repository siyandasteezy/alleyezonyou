import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { StatusBadge } from "@/components/status-badge";
import { duration, formatDate, formatTime, money } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

export default function BookingPage({ params }: PageProps<"/booking/[ref]">) {
  return (
    <div className="container-x max-w-2xl py-16">
      <Suspense fallback={<p className="text-muted">Loading your booking…</p>}>
        <BookingDetails params={params} />
      </Suspense>
    </div>
  );
}

async function BookingDetails({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.reference, ref),
    with: { service: true, stylist: true, customer: true },
  });
  if (!booking) notFound();

  const headline =
    booking.status === "cancelled"
      ? "This booking was cancelled"
      : booking.status === "confirmed"
        ? "You're booked in!"
        : booking.status === "completed"
          ? "Thanks for visiting!"
          : "Booking received";

  return (
    <>
      <p className="eyebrow mb-3">Reference {booking.reference}</p>
      <h1 className="text-5xl font-semibold">{headline}</h1>
      {booking.status === "pending" && (
        <p className="mt-4 text-muted">
          Thanks, {booking.customer.name.split(" ")[0]}. We&apos;ve emailed a copy to {booking.customer.email} and will
          confirm your appointment shortly.
        </p>
      )}

      <div className="card mt-8 divide-y divide-line">
        <Row label="Status" value={<StatusBadge status={booking.status} />} />
        <Row label="Service" value={`${booking.service.name} (${duration(booking.service.durationMins)})`} />
        <Row label="Stylist" value={booking.stylist.name} />
        <Row label="Date" value={formatDate(booking.startsAt, { weekday: "long", month: "long" })} />
        <Row label="Time" value={formatTime(booking.startsAt)} />
        <Row label="Price" value={`${booking.service.priceFrom ? "from " : ""}${money(booking.priceCents)}`} />
      </div>

      <p className="mt-6 text-sm text-muted">
        Need to reschedule or cancel? Message us on WhatsApp with your reference and we&apos;ll sort it out.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          className="btn-primary"
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, about my booking ${booking.reference}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp the spa
        </a>
        <Link href="/shop" className="btn-outline">
          Browse the shop
        </Link>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
