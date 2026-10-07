"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSlots, lockStylist } from "@/lib/availability";
import { contactSchema, upsertCustomer, type FormState } from "@/lib/customers";
import { formatDateTime, money } from "@/lib/format";
import { reference } from "@/lib/ids";
import { notifySalon, sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { isDateString, isTimeString, toInstant } from "@/lib/time";

const slotQuery = z.object({
  serviceId: z.number().int().positive(),
  date: z.string().refine(isDateString),
});

/** Open start times across every team member who offers the service. */
export async function fetchSlots(input: z.infer<typeof slotQuery>) {
  const parsed = slotQuery.safeParse(input);
  if (!parsed.success) return [];
  return getSlots({ ...parsed.data, stylistId: null });
}

const bookingSchema = contactSchema.extend({
  serviceId: z.coerce.number().int().positive(),
  date: z.string().refine(isDateString, "Pick a date"),
  time: z.string().refine(isTimeString, "Pick a time"),
  notes: z.string().trim().max(500).optional().default(""),
});

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const input = parsed.data;

  const service = await db.query.services.findFirst({
    where: and(eq(schema.services.id, input.serviceId), eq(schema.services.active, true)),
  });
  if (!service) return { error: "That service is no longer available." };

  // Clients book with the spa; assign the first team member free for this slot.
  // The owner can reassign it from the admin booking page.
  const slots = await getSlots({ serviceId: service.id, stylistId: null, date: input.date });
  const candidates = slots.find((s) => s.time === input.time)?.stylistIds ?? [];

  const startsAt = toInstant(input.date, input.time);
  const endsAt = new Date(startsAt.getTime() + service.durationMins * 60_000);

  let created: { reference: string; stylistId: number } | null = null;
  for (const stylistId of candidates) {
    created = await db.transaction(async (tx) => {
      await lockStylist(tx, stylistId);
      // Re-check under the lock: someone may have just taken it.
      const stillFree = (await getSlots({ serviceId: service.id, stylistId, date: input.date }, tx)).some(
        (s) => s.time === input.time,
      );
      if (!stillFree) return null;
      const customer = await upsertCustomer(tx, input);
      const [booking] = await tx
        .insert(schema.bookings)
        .values({
          reference: reference("BK"),
          customerId: customer.id,
          serviceId: service.id,
          stylistId,
          startsAt,
          endsAt,
          priceCents: service.priceCents,
          notes: input.notes,
        })
        .returning();
      return { reference: booking.reference, stylistId };
    });
    if (created) break;
  }

  if (!created) {
    return { error: "Sorry, that time was just taken. Please choose another slot." };
  }

  const stylist = await db.query.stylists.findFirst({ where: eq(schema.stylists.id, created.stylistId) });
  const when = formatDateTime(startsAt);
  const summary = [
    `Reference: ${created.reference}`,
    `Service: ${service.name}`,
    `When: ${when}`,
    `Price: ${service.priceFrom ? "from " : ""}${money(service.priceCents)}`,
  ].join("\n");

  await Promise.all([
    sendEmail({
      to: input.email,
      subject: `Booking received — ${service.name}, ${when}`,
      text: `Hi ${input.name},\n\nThanks for booking with ${site.name}! We've received your request and will confirm it shortly.\n\n${summary}\n\nNeed to change something? WhatsApp us on ${site.phone}.\n\n${site.name}`,
    }),
    notifySalon(
      `New booking: ${service.name}, ${when}`,
      `${summary}\nAssigned to: ${stylist?.name}\nClient: ${input.name}, ${input.phone}, ${input.email}\nNotes: ${input.notes || "—"}`,
    ),
  ]);

  redirect(`/booking/${created.reference}`);
}
