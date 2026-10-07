import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { bookableDateRange } from "@/lib/availability";
import { getServices } from "@/lib/catalog";
import { BookingWizard } from "./booking-wizard";

export const metadata: Metadata = { title: "Book an appointment" };

export default function BookPage() {
  return (
    <div className="container-x py-12">
      <p className="eyebrow mb-3">Online booking</p>
      <h1 className="mb-8 text-5xl font-semibold">Book an appointment</h1>
      <Suspense fallback={<p className="text-muted">Loading booking…</p>}>
        <Booking />
      </Suspense>
    </div>
  );
}

async function Booking() {
  await connection(); // date range depends on "today"
  const services = await getServices();
  const { min, max } = bookableDateRange();
  return <BookingWizard services={services} minDate={min} maxDate={max} />;
}
