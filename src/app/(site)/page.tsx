import Link from "next/link";
import { PlaceholderImage } from "@/components/placeholder-image";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/service-menu";
import { getProducts, getServices } from "@/lib/catalog";
import { duration, money } from "@/lib/format";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [services, products] = await Promise.all([getServices(), getProducts()]);
  const featured = services.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow mb-4">Lashes · Brows · Massages</p>
          <h1 className="text-5xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl">{site.name}</h1>
          <p className="mt-6 max-w-md text-lg text-muted">{site.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary px-7 py-3 text-base">
              Book an appointment
            </Link>
            <Link href="/shop" className="btn-outline px-7 py-3 text-base">
              Shop products
            </Link>
          </div>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
          <PlaceholderImage alt="Hero image" label="Hero image" />
        </div>
      </section>

      {/* Services overview */}
      <section className="container-x py-16">
        <SectionHeading eyebrow="Services" title="What we do">
          From lashes and brows to full-body massages — pick a treatment and a time that suits you, and our team will
          take care of the rest.
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <Link key={s.id} href={`/book?service=${s.id}`} className="card group p-6 transition hover:border-accent">
              <p className="eyebrow">{s.category}</p>
              <h3 className="mt-2 text-2xl font-semibold">{s.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{s.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span>
                  {s.priceFrom && "from "}
                  {money(s.priceCents)} · {duration(s.durationMins)}
                </span>
                <span className="font-semibold text-accent group-hover:underline">Book →</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/services" className="btn-outline">
            See the full menu
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-x py-16">
        <SectionHeading eyebrow="Gallery" title="Fresh from the chair" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-[var(--radius)] ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}
            >
              <PlaceholderImage alt={`Gallery image ${i + 1}`} label={`Gallery ${i + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Shop teaser */}
      {products.length > 0 && (
        <section className="container-x py-16">
          <SectionHeading eyebrow="Shop" title="Take the spa home">
            The products we use and trust, available for delivery or in-store pickup.
          </SectionHeading>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-x py-16">
        <div className="rounded-[var(--radius)] bg-accent px-6 py-14 text-center text-accent-ink sm:px-12">
          <h2 className="text-4xl font-semibold sm:text-5xl">Ready for your moment?</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-90">
            Booking takes less than a minute. We&apos;ll confirm your appointment straight away.
          </p>
          <Link href="/book" className="btn mt-8 bg-surface px-7 py-3 text-base text-ink hover:bg-surface-2">
            Book now
          </Link>
        </div>
      </section>
    </>
  );
}
