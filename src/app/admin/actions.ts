"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import type { BookingStatus, OrderStatus } from "@/db/schema";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { getSlots, lockStylist } from "@/lib/availability";
import { TAGS } from "@/lib/catalog";
import type { FormState } from "@/lib/customers";
import { formatDateTime, slugify } from "@/lib/format";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { isDateString, isTimeString, toInstant } from "@/lib/time";

/* ---------- Session ---------- */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Incorrect password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Bookings ---------- */

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function setBookingStatus(id: number, status: BookingStatus) {
  await requireAdmin();
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, id),
    with: { customer: true, service: true, stylist: true },
  });
  if (!booking || !BOOKING_TRANSITIONS[booking.status].includes(status)) return;

  await db.update(schema.bookings).set({ status }).where(eq(schema.bookings.id, id));

  const when = formatDateTime(booking.startsAt);
  if (status === "confirmed") {
    await sendEmail({
      to: booking.customer.email,
      subject: `Confirmed: ${booking.service.name}, ${when}`,
      text: `Hi ${booking.customer.name},\n\nYour appointment is confirmed.\n\n${booking.service.name} with ${booking.stylist.name}\n${when}\nReference: ${booking.reference}\n\nSee you soon!\n${site.name}`,
    });
  } else if (status === "cancelled") {
    await sendEmail({
      to: booking.customer.email,
      subject: `Cancelled: ${booking.service.name}, ${when}`,
      text: `Hi ${booking.customer.name},\n\nYour appointment for ${booking.service.name} on ${when} (ref ${booking.reference}) has been cancelled.\n\nTo rebook, visit our website or WhatsApp us on ${site.phone}.\n\n${site.name}`,
    });
  }
  revalidatePath("/admin", "layout");
}

const rescheduleSchema = z.object({
  id: z.coerce.number().int().positive(),
  stylistId: z.coerce.number().int().positive(),
  date: z.string().refine(isDateString, "Pick a date"),
  time: z.string().refine(isTimeString, "Pick a time"),
  override: z.literal("on").optional(),
});

export async function rescheduleBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = rescheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { id, stylistId, date, time, override } = parsed.data;

  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, id),
    with: { customer: true, service: true },
  });
  if (!booking) return { error: "Booking not found." };
  if (booking.status === "cancelled" || booking.status === "completed") {
    return { error: `This booking is ${booking.status} and can't be moved.` };
  }

  const startsAt = toInstant(date, time);
  const endsAt = new Date(startsAt.getTime() + booking.service.durationMins * 60_000);

  const ok = await db.transaction(async (tx) => {
    await lockStylist(tx, stylistId);
    if (!override) {
      const slots = await getSlots({ serviceId: booking.serviceId, stylistId, date, excludeBookingId: id }, tx);
      if (!slots.some((s) => s.time === time)) return false;
    }
    await tx.update(schema.bookings).set({ stylistId, startsAt, endsAt }).where(eq(schema.bookings.id, id));
    return true;
  });
  if (!ok) {
    return {
      error: "That stylist isn't available then. Pick another time, or tick “ignore availability” to force it.",
    };
  }

  const stylist = await db.query.stylists.findFirst({ where: eq(schema.stylists.id, stylistId) });
  await sendEmail({
    to: booking.customer.email,
    subject: `Rescheduled: ${booking.service.name}, ${formatDateTime(startsAt)}`,
    text: `Hi ${booking.customer.name},\n\nYour appointment has moved to ${formatDateTime(startsAt)} with ${stylist?.name}.\nReference: ${booking.reference}\n\nIf this doesn't suit you, WhatsApp us on ${site.phone}.\n\n${site.name}`,
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/bookings/${id}?saved=1`);
}

/* ---------- Orders ---------- */

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["ready", "shipped", "cancelled"],
  ready: ["completed", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export async function setOrderStatus(id: number, status: OrderStatus) {
  await requireAdmin();
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: { customer: true, items: true },
  });
  if (!order || !ORDER_TRANSITIONS[order.status].includes(status)) return;

  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status }).where(eq(schema.orders.id, id));
    // Put stock back when an order is cancelled.
    if (status === "cancelled") {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx
          .update(schema.products)
          .set({ stock: sql`${schema.products.stock} + ${item.quantity}` })
          .where(eq(schema.products.id, item.productId));
      }
    }
  });
  if (status === "cancelled") updateTag(TAGS.products);

  const messages: Partial<Record<OrderStatus, string>> = {
    paid: "We've received your payment — thank you! We're getting your order ready.",
    ready: `Your order is ready for collection at ${site.address.line1}, ${site.address.suburb}.`,
    shipped: "Your order is on its way!",
    cancelled: "Your order has been cancelled. If you've already paid, we'll be in touch about your refund.",
  };
  if (messages[status]) {
    await sendEmail({
      to: order.customer.email,
      subject: `Order ${order.reference} update`,
      text: `Hi ${order.customer.name},\n\n${messages[status]}\n\nOrder reference: ${order.reference}\n\n${site.name}`,
    });
  }
  revalidatePath("/admin", "layout");
}

/* ---------- Products ---------- */

const productSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Name is required"),
  categoryId: z.coerce.number().int().nonnegative(),
  price: z.coerce.number().min(0, "Price can't be negative"),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
  description: z.string().trim().default(""),
  images: z.string().default(""),
  active: z.literal("on").optional(),
});

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const p = parsed.data;

  const images = p.images
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s) || s.startsWith("/"));
  const values = {
    name: p.name,
    categoryId: p.categoryId || null,
    priceCents: Math.round(p.price * 100),
    stock: p.stock,
    description: p.description,
    images,
    active: p.active === "on",
  };

  if (p.id) {
    await db.update(schema.products).set(values).where(eq(schema.products.id, p.id));
  } else {
    let slug = slugify(p.name);
    if (await db.query.products.findFirst({ where: eq(schema.products.slug, slug) })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    await db.insert(schema.products).values({ ...values, slug });
  }
  updateTag(TAGS.products);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const sold = await db.query.orderItems.findFirst({ where: eq(schema.orderItems.productId, id) });
  if (sold) {
    // Keep order history intact: hide it instead.
    await db.update(schema.products).set({ active: false }).where(eq(schema.products.id, id));
  } else {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }
  updateTag(TAGS.products);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function addCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  await db
    .insert(schema.productCategories)
    .values({ name, slug: slugify(name), sortOrder: 99 })
    .onConflictDoNothing();
  updateTag(TAGS.products);
  revalidatePath("/admin/products");
}

/* ---------- Services ---------- */

const serviceSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  description: z.string().trim().default(""),
  durationMins: z.coerce.number().int().min(15).max(600),
  price: z.coerce.number().min(0),
  priceFrom: z.literal("on").optional(),
  active: z.literal("on").optional(),
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the service details (duration is 15–600 minutes)." };
  const s = parsed.data;
  const values = {
    name: s.name,
    category: s.category,
    description: s.description,
    durationMins: s.durationMins,
    priceCents: Math.round(s.price * 100),
    priceFrom: s.priceFrom === "on",
    active: s.active === "on",
  };
  if (s.id) {
    await db.update(schema.services).set(values).where(eq(schema.services.id, s.id));
  } else {
    await db
      .insert(schema.services)
      .values({ ...values, slug: `${slugify(s.name)}-${Date.now().toString(36)}`, sortOrder: 99 });
  }
  updateTag(TAGS.services);
  revalidatePath("/admin/services");
  return { error: undefined };
}

/* ---------- Team & availability ---------- */

const stylistSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Name is required"),
  role: z.string().trim().default("Stylist"),
  bio: z.string().trim().default(""),
  imageUrl: z.string().trim().default(""),
  capacity: z.coerce.number().int().min(1).max(10),
  active: z.literal("on").optional(),
});

export async function saveStylist(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = stylistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const s = parsed.data;
  const serviceIds = formData.getAll("serviceIds").map(Number).filter(Boolean);

  const hours: { weekday: number; startTime: string; endTime: string }[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    if (formData.get(`day-${weekday}`) !== "on") continue;
    const startTime = String(formData.get(`start-${weekday}`));
    const endTime = String(formData.get(`end-${weekday}`));
    if (!isTimeString(startTime) || !isTimeString(endTime) || startTime >= endTime) {
      return { error: "Each working day needs a start time before its end time." };
    }
    hours.push({ weekday, startTime, endTime });
  }

  const values = {
    name: s.name,
    role: s.role,
    bio: s.bio,
    imageUrl: s.imageUrl || null,
    capacity: s.capacity,
    active: s.active === "on",
  };

  const id = await db.transaction(async (tx) => {
    let stylistId = s.id;
    if (stylistId) {
      await tx.update(schema.stylists).set(values).where(eq(schema.stylists.id, stylistId));
    } else {
      [{ id: stylistId }] = await tx
        .insert(schema.stylists)
        .values({ ...values, sortOrder: 99 })
        .returning({ id: schema.stylists.id });
    }
    await tx.delete(schema.stylistServices).where(eq(schema.stylistServices.stylistId, stylistId));
    if (serviceIds.length) {
      await tx
        .insert(schema.stylistServices)
        .values(serviceIds.map((serviceId) => ({ stylistId: stylistId!, serviceId })));
    }
    await tx.delete(schema.stylistHours).where(eq(schema.stylistHours.stylistId, stylistId));
    if (hours.length) {
      await tx.insert(schema.stylistHours).values(hours.map((h) => ({ ...h, stylistId: stylistId! })));
    }
    return stylistId;
  });

  updateTag(TAGS.stylists);
  revalidatePath("/admin/team");
  redirect(`/admin/team/${id}?saved=1`);
}

export async function addTimeOff(formData: FormData) {
  await requireAdmin();
  const stylistId = Number(formData.get("stylistId"));
  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!stylistId || !isDateString(date)) return;
  await db.insert(schema.stylistTimeOff).values({ stylistId, date, reason }).onConflictDoNothing();
  revalidatePath(`/admin/team/${stylistId}`);
}

export async function removeTimeOff(id: number, stylistId: number) {
  await requireAdmin();
  await db
    .delete(schema.stylistTimeOff)
    .where(and(eq(schema.stylistTimeOff.id, id), eq(schema.stylistTimeOff.stylistId, stylistId)));
  revalidatePath(`/admin/team/${stylistId}`);
}
