import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const address = `${site.address.line1}, ${site.address.suburb}, ${site.address.city}, ${site.address.postalCode}`;
  return (
    <>
      <PageHero eyebrow="Contact" title="Come and" accent="see us." photo={photos.portrait2}>
        Questions about a treatment or a booking? WhatsApp is the quickest way to reach us.
      </PageHero>
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Address</h2>
              <p className="mt-2 text-muted">{address}</p>
              <a
                className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                Get directions →
              </a>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Opening hours</h2>
              <ul className="mt-2 space-y-1 text-muted">
                {site.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-6 border-b border-line py-1.5">
                    <span>{h.days}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Talk to us</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <a className="btn-primary" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <a className="btn-outline" href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  Call {site.phone}
                </a>
                <a className="btn-outline" href={`tel:${site.altPhone.replace(/\s/g, "")}`}>
                  Call {site.altPhone}
                </a>
                <a className="btn-outline" href={`mailto:${site.email}`}>
                  Email
                </a>
              </div>
            </div>
            <Link href="/book" className="btn-primary px-7 py-3 text-base">
              Book an appointment
            </Link>
          </div>

          <div className="min-h-[360px] overflow-hidden rounded-[var(--radius)] border border-line">
            <iframe
              title={`Map showing ${site.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
              className="h-full min-h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </>
  );
}
