import { and, asc, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { FilterTabs, PageHeader, Table, Td } from "@/components/admin-ui";
import { StatusBadge } from "@/components/status-badge";
import { db, schema } from "@/db";
import { bookingStatus, type BookingStatus } from "@/db/schema";
import { formatDate, formatTime, money } from "@/lib/format";
import { addDays, localDateString, toInstant } from "@/lib/time";
import { BookingActions } from "../booking-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Bookings" };

const VIEWS = { upcoming: "Upcoming", today: "Today", past: "Past", all: "All" } as const;
type View = keyof typeof VIEWS;

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const sp = await searchParams;
  const view: View = (Object.keys(VIEWS) as View[]).find((v) => v === sp.view) ?? "upcoming";
  const status = bookingStatus.enumValues.find((s) => s === sp.status) as BookingStatus | undefined;

  const today = localDateString();
  const todayStart = toInstant(today, "00:00");
  const where: SQL[] = [];
  if (view === "upcoming") where.push(gte(schema.bookings.startsAt, todayStart));
  if (view === "today")
    where.push(
      gte(schema.bookings.startsAt, todayStart),
      lt(schema.bookings.startsAt, toInstant(addDays(today, 1), "00:00")),
    );
  if (view === "past") where.push(lt(schema.bookings.startsAt, todayStart));
  if (status) where.push(eq(schema.bookings.status, status));

  const bookings = await db.query.bookings.findMany({
    where: and(...where),
    with: { customer: true, service: true, stylist: true },
    orderBy: view === "past" || view === "all" ? desc(schema.bookings.startsAt) : asc(schema.bookings.startsAt),
    limit: 200,
  });

  const href = (next: { view?: string; status?: string }) => {
    const p = new URLSearchParams();
    const v = next.view ?? view;
    const s = "status" in next ? next.status : status;
    if (v !== "upcoming") p.set("view", v);
    if (s) p.set("status", s);
    const q = p.toString();
    return `/admin/bookings${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Bookings" />
      <FilterTabs
        active={view}
        items={(Object.keys(VIEWS) as View[]).map((v) => ({ key: v, label: VIEWS[v], href: href({ view: v }) }))}
      />
      <FilterTabs
        active={status ?? "any"}
        items={[
          { key: "any", label: "Any status", href: href({ status: undefined }) },
          ...bookingStatus.enumValues.map((s) => ({
            key: s,
            label: s[0].toUpperCase() + s.slice(1),
            href: href({ status: s }),
          })),
        ]}
      />

      <Table head={["When", "Client", "Service", "Assigned to", "Status", ""]} empty="No bookings match these filters.">
        {bookings.map((b) => (
          <tr key={b.id}>
            <Td className="whitespace-nowrap">
              <p className="font-medium">{formatDate(b.startsAt)}</p>
              <p className="text-xs text-muted">
                {formatTime(b.startsAt)}–{formatTime(b.endsAt)} · {b.reference}
              </p>
            </Td>
            <Td>
              <p className="font-medium">{b.customer.name}</p>
              <p className="text-xs text-muted">
                <a href={`tel:${b.customer.phone}`}>{b.customer.phone}</a>
              </p>
            </Td>
            <Td>
              <p>{b.service.name}</p>
              <p className="text-xs text-muted">{money(b.priceCents)}</p>
              {b.notes && <p className="mt-1 max-w-xs text-xs text-muted italic">“{b.notes}”</p>}
            </Td>
            <Td>{b.stylist.name}</Td>
            <Td>
              <StatusBadge status={b.status} />
            </Td>
            <Td>
              <BookingActions id={b.id} status={b.status} />
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
