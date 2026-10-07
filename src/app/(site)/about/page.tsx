import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PlaceholderImage } from "@/components/placeholder-image";
import { getStylists } from "@/lib/catalog";
import { photos } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About & Team" };

export default async function AboutPage() {
  const team = await getStylists();
  return (
    <>
      <PageHero eyebrow="Our story" title="Beauty," accent="intensifi-eye-d." photo={photos.robe}>
        {site.name} is where lashes, brows and body care meet: one place to look good and feel even better.
      </PageHero>

      <section className="container-x grid items-center gap-14 py-24 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-lg">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[var(--radius)]">
            <Image
              src={photos.backMassage.src}
              alt={photos.backMassage.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-2 -bottom-8 h-40 w-40 overflow-hidden rounded-full border-4 border-bg shadow-xl sm:-right-10">
            <Image src={photos.skincare.src} alt={photos.skincare.alt} fill sizes="160px" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Who we are</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">
            Made for the moment <em className="text-accent">all eyez are on you.</em>
          </h2>
          {/* TODO: replace with the owner's own story */}
          <div className="mt-6 space-y-4 text-muted">
            <p>
              Placeholder story: how the spa started, what it stands for and what clients can expect when they walk
              through the door. Replace with the owner&apos;s own words.
            </p>
            <p>
              A second paragraph on the spa&apos;s approach: precise lash and brow work, unhurried massages, honest
              advice, and leaving every client feeling like the main event.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary">
              Book a treatment
            </Link>
            <Link href="/services" className="btn-outline">
              See the price list
            </Link>
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="bg-blush/50">
          <div className="container-x py-24">
            <div className="mb-12 max-w-xl">
              <p className="eyebrow mb-4">The team</p>
              <h2 className="text-4xl sm:text-5xl">The hands behind the look.</h2>
              <p className="mt-4 text-muted">
                Book any treatment and we&apos;ll pair you with the right person on the day.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <article key={member.id}>
                  <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[var(--radius)]">
                    <PlaceholderImage src={member.imageUrl} alt={member.name} label="Photo coming soon" />
                  </div>
                  <h3 className="mt-5 text-2xl">{member.name}</h3>
                  <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
                    {member.role}
                  </p>
                  {member.bio && <p className="mt-2 text-sm text-muted">{member.bio}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
