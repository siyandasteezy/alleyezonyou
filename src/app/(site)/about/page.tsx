import type { Metadata } from "next";
import { PlaceholderImage } from "@/components/placeholder-image";
import { SectionHeading } from "@/components/service-menu";
import { getStylists } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About & Team" };

export default async function AboutPage() {
  const stylists = await getStylists();
  return (
    <>
      <section className="container-x grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
          <PlaceholderImage alt="Inside the spa" label="Spa interior" />
        </div>
        <div>
          <p className="eyebrow mb-3">Our story</p>
          <h1 className="text-5xl font-semibold">About {site.shortName}</h1>
          <div className="mt-6 space-y-4 text-muted">
            <p>
              Placeholder story — how the spa started, what it stands for and what clients can expect when they walk
              through the door. Replace with the owner&apos;s own words.
            </p>
            <p>
              A second paragraph on the spa&apos;s approach: beauty intensifi-eye-d, honest advice, and leaving every
              client feeling like all eyez are on them.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <SectionHeading eyebrow="The team" title="Meet the team">
          Book any treatment and we&apos;ll pair you with the right person on the day.
        </SectionHeading>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stylists.map((s) => (
            <article key={s.id}>
              <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
                <PlaceholderImage src={s.imageUrl} alt={s.name} label="Team photo" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{s.name}</h3>
              <p className="text-sm text-accent">{s.role}</p>
              {s.bio && <p className="mt-2 text-sm text-muted">{s.bio}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
