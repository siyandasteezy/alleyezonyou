import Image from "next/image";
import Link from "next/link";
import { EyeMark } from "@/components/logo";
import { ProductCard } from "@/components/product-card";
import { getProducts, getServices } from "@/lib/catalog";
import { categorySlug, duration, rands } from "@/lib/format";
import { categoryPhotos, galleryPhotos, photos } from "@/lib/images";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [services, products] = await Promise.all([getServices(), getProducts()]);
  const categories = [...new Set(services.map((s) => s.category))].map((name) => {
    const inCategory = services.filter((s) => s.category === name);
    return {
      name,
      count: inCategory.length,
      from: Math.min(...inCategory.map((s) => s.priceCents)),
      photo: categoryPhotos[name] ?? photos.heroDetail,
    };
  });
  const lashes = services.filter((s) => s.category === "Lashes");
  const massages = services.filter((s) => s.category === "Massages");

  return (
    <>
      <Hero categories={categories} />
      <Marquee items={services.map((s) => s.name)} />
      <Pillars />

      {/* Treatments */}
      <section className="container-x py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">The menu</p>
            <h2 className="text-4xl leading-tight sm:text-6xl">
              Every detail, <em className="whitespace-nowrap text-accent">intensifi-eye-d.</em>
            </h2>
          </div>
          <Link href="/services" className="btn-outline">
            Full price list
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/services#${categorySlug(c.name)}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-white transition hover:border-accent hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={c.photo.src}
                  alt={c.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: c.photo.position }}
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[11px] font-semibold tracking-[0.28em] text-accent uppercase">
                  {c.count} treatments
                </p>
                <h3 className="mt-2 flex-1 text-2xl leading-tight xl:text-3xl">{c.name}</h3>
                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                  <span className="font-display text-xl">
                    <span className="font-sans text-xs text-muted">from </span>
                    {rands(c.from)}
                  </span>
                  <span className="text-xs font-semibold tracking-[0.2em] text-muted uppercase transition group-hover:text-accent">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Lash feature */}
      {lashes.length > 0 && (
        <section className="relative overflow-hidden bg-blush/50">
          <div className="container-x grid items-center gap-16 py-24 lg:grid-cols-2">
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[var(--radius)]">
                <Image
                  src={photos.lashApplication.src}
                  alt={photos.lashApplication.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -right-2 -bottom-6 rounded-[var(--radius)] bg-white px-6 py-5 text-ink shadow-2xl sm:-right-10">
                <p className="text-[10px] tracking-[0.25em] text-accent uppercase">Lash sets from</p>
                <p className="mt-1 font-display text-4xl">{rands(Math.min(...lashes.map((s) => s.priceCents)))}</p>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Lash studio</p>
              <h2 className="text-4xl leading-tight sm:text-5xl">Lashes that do the talking.</h2>
              <p className="mt-5 max-w-md text-muted">
                From a soft, natural classic set to full, fluffy volume, each set is mapped to your eye shape and
                applied lash by lash.
              </p>
              <PriceList items={lashes} />
            </div>
          </div>
        </section>
      )}

      {/* Massage feature */}
      {massages.length > 0 && (
        <section className="relative overflow-hidden bg-white text-ink">
          <Image
            src={photos.massages.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "70% 50%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50" />
          <div className="container-x relative grid gap-12 py-24 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-4">Body & massage</p>
              <h2 className="text-4xl leading-tight sm:text-5xl">
                Unwind. <em className="text-accent">Fully.</em>
              </h2>
              <p className="mt-5 max-w-md text-muted">
                Hot stones, aromatherapy, deep tissue and reflexology. Leave the week on the table.
              </p>
              <Link href={`/services#${categorySlug("Massages")}`} className="btn-primary mt-8">
                Book a massage
              </Link>
            </div>
            <PriceList items={massages} />
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="container-x py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">The look</p>
            <h2 className="text-4xl sm:text-5xl">All eyez on you.</h2>
          </div>
          <a href={site.social.instagram} target="_blank" rel="noreferrer" className="btn-outline">
            Follow on Instagram
          </a>
        </div>
        <div className="grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[240px] md:grid-cols-4">
          {galleryPhotos.map((p, i) => (
            <div
              key={p.src}
              className={`relative overflow-hidden rounded-[var(--radius)] ${i === 0 || i === 3 ? "row-span-2" : ""}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition duration-700 hover:scale-105"
                style={{ objectPosition: p.position }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Training */}
      <section className="relative overflow-hidden">
        <Image src={photos.satin.src} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-white/35" />
        <div className="container-x relative py-24 text-center">
          <EyeMark className="mx-auto h-12 w-16 text-ink" />
          <p className="eyebrow mt-6 mb-4">Training academy</p>
          <h2 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-5xl">Turn your passion into your craft.</h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {site.training.map((t) => (
              <div key={t.name} className="rounded-[var(--radius)] bg-white/80 p-6 backdrop-blur">
                <p className="text-sm font-semibold tracking-[0.12em] uppercase">{t.name}</p>
                <p className="mt-2 font-display text-3xl text-accent">{rands(t.priceCents)}</p>
              </div>
            ))}
          </div>
          <a
            className="btn-primary mt-10"
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi, I'd like to know more about your training courses")}`}
            target="_blank"
            rel="noreferrer"
          >
            Enquire about the next intake
          </a>
        </div>
      </section>

      {/* Shop teaser */}
      {products.length > 0 && (
        <section className="container-x py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow mb-4">The shop</p>
              <h2 className="text-4xl sm:text-5xl">Keep the glow going.</h2>
              <p className="mt-4 text-muted">Aftercare and favourites, delivered or collected at your next visit.</p>
            </div>
            <Link href="/shop" className="btn-outline">
              Shop all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-line bg-white text-ink">
        <div className="pointer-events-none absolute -right-40 -bottom-40 h-[480px] w-[480px] rounded-full bg-blush/80 blur-[120px]" />
        <div className="container-x relative grid items-center gap-12 py-20 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-5xl leading-[1.05] sm:text-7xl">
              Your moment <em className="text-accent">starts here.</em>
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Booking takes under a minute. Choose a treatment and a time, and we&apos;ll take care of the rest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary">
                Book now
              </Link>
              <a href={`https://wa.me/${site.whatsapp}`} className="btn-outline" target="_blank" rel="noreferrer">
                WhatsApp us
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm rounded-full border border-gold/40 p-3">
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <Image
                src={photos.glow.src}
                alt={photos.glow.alt}
                fill
                sizes="(min-width: 768px) 30vw, 80vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Hero({ categories }: { categories: { name: string; from: number }[] }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white text-ink">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blush/80 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-gold/15 blur-[120px]" />

      <div className="container-x relative grid items-center gap-16 pt-14 pb-24 lg:grid-cols-[1.15fr_1fr] lg:pt-20 lg:pb-28">
        <div className="animate-rise">
          <p className="eyebrow mb-6">Lashes · Brows · Massages</p>
          <h1 className="text-[clamp(2.5rem,8.6vw,4.9rem)] leading-[1.02]">
            Beauty,
            <br />
            <em className="whitespace-nowrap text-accent">intensifi-eye-d.</em>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Lash extensions, semi-permanent brows and full-body massages, all under one roof. Book online in under a
            minute.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary px-8 py-4">
              Book a treatment
            </Link>
            <Link href="/services" className="btn-outline px-8 py-4">
              View price list
            </Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 sm:grid-cols-4">
            {categories.map((c) => (
              <div key={c.name}>
                <dt className="text-[10px] tracking-[0.2em] text-muted uppercase">
                  {c.name.replace("Semi-Permanent", "Semi-perm")}
                </dt>
                <dd className="mt-1 font-display text-2xl">
                  <span className="font-sans text-[11px] text-muted">from </span>
                  {rands(c.from)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[440px] animate-rise [animation-delay:150ms]">
          <div className="relative aspect-[4/5] rounded-t-full rounded-b-[var(--radius)] border border-gold/40 p-2">
            <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[calc(var(--radius)-6px)]">
              <Image
                src={photos.hero.src}
                alt={photos.hero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 440px, 90vw"
                className="object-cover"
                style={{ objectPosition: photos.hero.position }}
              />
            </div>
          </div>
          <div className="absolute -bottom-8 -left-2 h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-2xl sm:-left-12 sm:h-44 sm:w-44">
            <Image
              src={photos.heroDetail.src}
              alt={photos.heroDetail.alt}
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
          <div className="absolute top-12 -right-1 rounded-full bg-gold px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-ink uppercase shadow-xl sm:-right-6">
            Book online 24/7
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-line bg-white py-4 text-ink" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-lg text-ink/80 italic">
            {item}
            <span className="text-accent not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    {
      title: "Book in a minute",
      body: "Pick a treatment and a time online, day or night.",
      icon: <path d="M4 7h16v13H4zM4 11h16M9 3v4M15 3v4" />,
    },
    {
      title: "Lashes, brows & body",
      body: "Lash sets, semi-permanent brows and full-body massages under one roof.",
      icon: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
    },
    {
      title: "Pay at the spa",
      body: "Nothing to pay online. Settle up after your treatment.",
      icon: <path d="M3 7h18v11H3zM3 11h18M7 15h3" />,
    },
  ];
  return (
    <section className="bg-blush/60">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-accent/30 text-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                {item.icon}
              </svg>
            </span>
            <div>
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriceList({
  items,
}: {
  items: { id: number; name: string; durationMins: number; priceCents: number; priceFrom: boolean }[];
}) {
  return (
    <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
      {items.map((s) => (
        <li key={s.id}>
          <Link href={`/book?service=${s.id}`} className="group flex items-baseline gap-3 py-4">
            <span className="font-display text-lg sm:text-xl">{s.name}</span>
            <span className="hidden text-xs text-muted sm:inline">{duration(s.durationMins)}</span>
            <span className="flex-1 border-b border-dotted border-ink/25" />
            <span className="font-semibold whitespace-nowrap">
              {s.priceFrom && "from "}
              {rands(s.priceCents)}
            </span>
            <span className="hidden text-[10px] font-semibold tracking-[0.2em] text-accent uppercase transition group-hover:translate-x-0.5 sm:inline">
              Book →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
