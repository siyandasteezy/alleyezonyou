import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getServices } from "@/lib/catalog";
import { categorySlug, duration, rands } from "@/lib/format";
import { categoryPhotos, photos } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Treatments & Prices" };

export default async function ServicesPage() {
  const services = await getServices();
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <>
      <PageHero eyebrow="Price list" title="Treatments" accent="& prices." photo={photos.lashApplication}>
        Book any treatment online and we&apos;ll match you with the right therapist. Payment is made at the spa after
        your appointment.
      </PageHero>

      {/* Category jump links */}
      <nav className="sticky top-[108px] z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="container-x flex gap-6 overflow-x-auto py-4 text-[11px] font-semibold tracking-[0.2em] whitespace-nowrap uppercase">
          {categories.map((c) => (
            <a key={c} href={`#${categorySlug(c)}`} className="text-muted transition hover:text-accent">
              {c}
            </a>
          ))}
          <a href="#training" className="text-muted transition hover:text-accent">
            Training
          </a>
        </div>
      </nav>

      <div className="container-x divide-y divide-line">
        {categories.map((category, i) => {
          const photo = categoryPhotos[category] ?? photos.heroDetail;
          return (
            <section
              key={category}
              id={categorySlug(category)}
              className="grid scroll-mt-44 items-start gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20"
            >
              <div className={`relative lg:sticky lg:top-44 ${i % 2 ? "lg:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] lg:aspect-[4/5]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: photo.position }}
                  />
                </div>
              </div>
              <div>
                <p className="eyebrow mb-3">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="text-4xl sm:text-5xl">{category}</h2>
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {services
                    .filter((s) => s.category === category)
                    .map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6 sm:flex-nowrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3">
                            <h3 className="font-display text-xl sm:text-2xl">{s.name}</h3>
                            <span className="hidden flex-1 border-b border-dotted border-ink/20 sm:block" />
                            <span className="font-semibold whitespace-nowrap">
                              {s.priceFrom && <span className="text-xs font-normal text-muted">from </span>}
                              {rands(s.priceCents)}
                            </span>
                          </div>
                          {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
                          <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
                            {duration(s.durationMins)}
                          </p>
                        </div>
                        <Link href={`/book?service=${s.id}`} className="btn-outline btn-sm shrink-0">
                          Book
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* Training */}
      <section id="training" className="scroll-mt-44 bg-night text-white">
        <div className="container-x grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-gold">Training academy</p>
            <h2 className="text-4xl sm:text-5xl">
              Learn <em className="text-blush">the craft.</em>
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              Want to start your own lash or brow business? Message us to find out about the next intake.
            </p>
            <a
              className="btn-light mt-8"
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi, I'd like to know more about your training courses")}`}
              target="_blank"
              rel="noreferrer"
            >
              Enquire on WhatsApp
            </a>
          </div>
          <ul className="divide-y divide-white/10 self-center border-y border-white/10">
            {site.training.map((t) => (
              <li key={t.name} className="flex items-baseline gap-4 py-6">
                <span className="font-display text-2xl">{t.name}</span>
                <span className="flex-1 border-b border-dotted border-white/25" />
                <span className="font-semibold">{rands(t.priceCents)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
