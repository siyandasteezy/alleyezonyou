import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, ServiceMenu } from "@/components/service-menu";
import { getServices } from "@/lib/catalog";
import { money } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Services & Prices" };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="container-x py-16">
      <SectionHeading eyebrow="Menu" title="Services & prices">
        Book any treatment online and we&apos;ll match you with one of our therapists. Payment is made at the spa after
        your appointment.
      </SectionHeading>
      <ServiceMenu services={services} />
      <div className="mt-12">
        <Link href="/book" className="btn-primary px-7 py-3 text-base">
          Book an appointment
        </Link>
      </div>

      <section className="mt-20">
        <SectionHeading eyebrow="Training" title="Learn the craft">
          Want to learn? Message us to find out about the next intake.
        </SectionHeading>
        <ul className="max-w-xl divide-y divide-line border-y border-line">
          {site.training.map((t) => (
            <li key={t.name} className="flex justify-between gap-4 py-4">
              <span className="font-medium">{t.name}</span>
              <span className="font-medium">{money(t.priceCents)}</span>
            </li>
          ))}
        </ul>
        <a
          className="btn-outline mt-6"
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi, I'd like to know more about your training courses")}`}
          target="_blank"
          rel="noreferrer"
        >
          Enquire on WhatsApp
        </a>
      </section>
    </div>
  );
}
