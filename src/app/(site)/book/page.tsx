import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { bookableDateRange } from "@/lib/availability";
import { PageHero } from "@/components/page-hero";
import { getServices } from "@/lib/catalog";
import { BookingWizard } from "./booking-wizard";

export const metadata: Metadata = { title: "Book an appointment" };

export default function BookPage() {
  return (
    <>
      <PageHero eyebrow="Online booking" title="Book your" accent="moment.">
        Choose a treatment and a time. We&apos;ll assign the right therapist and confirm by email.
      </PageHero>
      <div className="container-x py-12">
        <Suspense fallback={<p className="text-muted">Loading booking…</p>}>
          <Booking />
        </Suspense>
      </div>
    </>
  );
}

async function Booking() {
  await connection(); // date range depends on "today"
  const services = await getServices();
  const { min, max } = bookableDateRange();
  return <BookingWizard services={services} minDate={min} maxDate={max} />;
}
