import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, ServiceMenu } from "@/components/service-menu";
import { getServices } from "@/lib/catalog";

export const metadata: Metadata = { title: "Services & Prices" };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="container-x py-16">
      <SectionHeading eyebrow="Menu" title="Services & prices">
        Prices marked &ldquo;from&rdquo; may vary with hair length and thickness — your stylist will confirm before
        starting.
      </SectionHeading>
      <ServiceMenu services={services} />
      <div className="mt-12">
        <Link href="/book" className="btn-primary px-7 py-3 text-base">
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
