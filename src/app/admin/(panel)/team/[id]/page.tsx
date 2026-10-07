import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, gte } from "drizzle-orm";
import { PageHeader } from "@/components/admin-ui";
import { SubmitButton } from "@/components/confirm-button";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/format";
import { localDateString } from "@/lib/time";
import { addTimeOff, removeTimeOff } from "../../../actions";
import { StylistForm } from "./stylist-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Team member" };

export default async function StylistPage({ params, searchParams }: PageProps<"/admin/team/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const stylistId = Number(id) || 0;

  const [stylist, services, timeOff] = await Promise.all([
    isNew
      ? null
      : db.query.stylists
          .findFirst({
            where: eq(schema.stylists.id, stylistId),
            with: { hours: true, services: true },
          })
          .then((s) => s ?? null),
    db.select().from(schema.services).orderBy(asc(schema.services.sortOrder)),
    isNew
      ? []
      : db
          .select()
          .from(schema.stylistTimeOff)
          .where(
            and(eq(schema.stylistTimeOff.stylistId, stylistId), gte(schema.stylistTimeOff.date, localDateString())),
          )
          .orderBy(asc(schema.stylistTimeOff.date)),
  ]);
  if (!isNew && !stylist) notFound();

  return (
    <>
      <Link href="/admin/team" className="text-sm text-muted hover:text-ink">
        ← Team
      </Link>
      <PageHeader title={stylist?.name ?? "New team member"} />
      {sp.saved && <p className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Saved.</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <StylistForm
          services={services.map((s) => ({ id: s.id, name: s.name, category: s.category }))}
          stylist={
            stylist && {
              id: stylist.id,
              name: stylist.name,
              role: stylist.role,
              bio: stylist.bio,
              imageUrl: stylist.imageUrl ?? "",
              capacity: stylist.capacity,
              active: stylist.active,
              serviceIds: stylist.services.map((s) => s.serviceId),
              hours: stylist.hours.map((h) => ({ weekday: h.weekday, startTime: h.startTime, endTime: h.endTime })),
            }
          }
        />

        {stylist && (
          <div className="card h-fit p-5">
            <h2 className="text-xl font-semibold">Days off</h2>
            <p className="mt-1 text-xs text-muted">
              No bookings will be offered with {stylist.name.split(" ")[0]} on these days.
            </p>
            <form action={addTimeOff} className="mt-4 space-y-2">
              <input type="hidden" name="stylistId" value={stylist.id} />
              <input type="date" name="date" min={localDateString()} required className="input" />
              <input name="reason" placeholder="Reason (optional)" className="input" />
              <SubmitButton className="btn-outline w-full">Add day off</SubmitButton>
            </form>
            <ul className="mt-4 divide-y divide-line text-sm">
              {timeOff.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                  <span>
                    {formatDate(t.date + "T12:00:00+02:00")}
                    {t.reason && <span className="text-muted"> · {t.reason}</span>}
                  </span>
                  <form action={removeTimeOff.bind(null, t.id, stylist.id)}>
                    <SubmitButton className="btn-ghost btn-sm text-muted">Remove</SubmitButton>
                  </form>
                </li>
              ))}
              {timeOff.length === 0 && <li className="py-2 text-muted">None scheduled.</li>}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
