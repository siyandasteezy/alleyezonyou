import { and, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import { site } from "./site";
import { addDays, localDateString, minutesOf, timeOf, toInstant, weekdayOf } from "./time";

type Executor = typeof db | Tx;

export type Slot = { time: string; stylistIds: number[] };

const BLOCKING_STATUSES = ["pending", "confirmed"] as const;

export function bookableDateRange() {
  const today = localDateString();
  return { min: today, max: addDays(today, site.maxAdvanceDays) };
}

/**
 * Open start times for a service on a salon-local date. When stylistId is null,
 * slots from every stylist who offers the service are merged.
 */
export async function getSlots(
  opts: { serviceId: number; stylistId: number | null; date: string; excludeBookingId?: number },
  ex: Executor = db,
): Promise<Slot[]> {
  const { serviceId, stylistId, date, excludeBookingId } = opts;
  const range = bookableDateRange();
  if (date < range.min || date > range.max) return [];

  const service = await ex.query.services.findFirst({
    where: and(eq(schema.services.id, serviceId), eq(schema.services.active, true)),
  });
  if (!service) return [];

  const offering = await ex
    .select({ id: schema.stylists.id, capacity: schema.stylists.capacity })
    .from(schema.stylistServices)
    .innerJoin(schema.stylists, eq(schema.stylists.id, schema.stylistServices.stylistId))
    .where(
      and(
        eq(schema.stylistServices.serviceId, serviceId),
        eq(schema.stylists.active, true),
        stylistId ? eq(schema.stylists.id, stylistId) : undefined,
      ),
    );
  if (!offering.length) return [];
  const ids = offering.map((s) => s.id);

  const dayStart = toInstant(date, "00:00");
  const dayEnd = toInstant(addDays(date, 1), "00:00");

  // Sequential on purpose: inside a transaction these share one connection.
  const hours = await ex
    .select()
    .from(schema.stylistHours)
    .where(and(inArray(schema.stylistHours.stylistId, ids), eq(schema.stylistHours.weekday, weekdayOf(date))));
  const timeOff = await ex
    .select({ stylistId: schema.stylistTimeOff.stylistId })
    .from(schema.stylistTimeOff)
    .where(and(inArray(schema.stylistTimeOff.stylistId, ids), eq(schema.stylistTimeOff.date, date)));
  const existing = await ex
    .select({
      stylistId: schema.bookings.stylistId,
      startsAt: schema.bookings.startsAt,
      endsAt: schema.bookings.endsAt,
    })
    .from(schema.bookings)
    .where(
      and(
        inArray(schema.bookings.stylistId, ids),
        inArray(schema.bookings.status, [...BLOCKING_STATUSES]),
        lt(schema.bookings.startsAt, dayEnd),
        gt(schema.bookings.endsAt, dayStart),
        excludeBookingId ? ne(schema.bookings.id, excludeBookingId) : undefined,
      ),
    );

  const off = new Set(timeOff.map((t) => t.stylistId));
  const earliest = Date.now() + site.minLeadMins * 60_000;
  const byTime = new Map<string, number[]>();

  for (const stylist of offering) {
    if (off.has(stylist.id)) continue;
    const theirBookings = existing.filter((b) => b.stylistId === stylist.id);
    for (const block of hours.filter((h) => h.stylistId === stylist.id)) {
      const end = minutesOf(block.endTime);
      for (let m = minutesOf(block.startTime); m + service.durationMins <= end; m += site.slotIntervalMins) {
        const time = timeOf(m);
        const start = toInstant(date, time);
        if (start.getTime() < earliest) continue;
        const finish = new Date(start.getTime() + service.durationMins * 60_000);
        const overlapping = theirBookings.filter((b) => b.startsAt < finish && b.endsAt > start).length;
        if (overlapping >= stylist.capacity) continue;
        byTime.set(time, [...(byTime.get(time) ?? []), stylist.id]);
      }
    }
  }

  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, stylistIds]) => ({ time, stylistIds }));
}

/** Serialises booking writes per stylist so two customers can't take the last spot. */
export async function lockStylist(tx: Tx, stylistId: number) {
  await tx.execute(sql`select pg_advisory_xact_lock(${stylistId})`);
}
