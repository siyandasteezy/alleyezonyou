import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin-ui";
import { db, schema } from "@/db";
import { ServiceRow } from "./service-row";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  await requireAdmin();
  const services = await db
    .select()
    .from(schema.services)
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.name));
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <>
      <PageHeader title="Services" />
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Prices and durations here drive the booking calendar. Remember to assign new services to team members under Team
        &amp; hours.
      </p>
      <datalist id="service-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="space-y-3">
        {services.map((s) => (
          <ServiceRow
            key={s.id}
            service={{
              id: s.id,
              name: s.name,
              category: s.category,
              description: s.description,
              durationMins: s.durationMins,
              price: (s.priceCents / 100).toFixed(2),
              priceFrom: s.priceFrom,
              active: s.active,
            }}
          />
        ))}
        <h2 className="pt-6 text-2xl font-semibold">Add a service</h2>
        <ServiceRow service={null} />
      </div>
    </>
  );
}
