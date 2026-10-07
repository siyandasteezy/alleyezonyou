"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { TAGS } from "@/lib/catalog";
import { contactSchema, upsertCustomer, type FormState } from "@/lib/customers";
import { money } from "@/lib/format";
import { reference } from "@/lib/ids";
import { notifySalon, sendEmail } from "@/lib/notify";
import { deliveryFee } from "@/lib/shop";
import { site } from "@/lib/site";

const itemsSchema = z
  .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) }))
  .min(1, "Your cart is empty");

const addressSchema = z.object({
  line1: z.string().trim().min(3, "Street address is required"),
  line2: z.string().trim().optional(),
  suburb: z.string().trim().min(2, "Suburb is required"),
  city: z.string().trim().min(2, "City is required"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Use a 4-digit postal code"),
});

const checkoutSchema = contactSchema.extend({
  fulfilment: z.enum(["delivery", "pickup"]),
  notes: z.string().trim().max(500).optional().default(""),
  items: z.string().transform((s, ctx) => {
    try {
      return itemsSchema.parse(JSON.parse(s));
    } catch {
      ctx.addIssue({ code: "custom", message: "Your cart could not be read. Please refresh and try again." });
      return z.NEVER;
    }
  }),
});

class OutOfStock extends Error {}

export async function placeOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const input = parsed.data;

  let address = null;
  if (input.fulfilment === "delivery") {
    const a = addressSchema.safeParse(raw);
    if (!a.success) return { fieldErrors: z.flattenError(a.error).fieldErrors };
    address = a.data;
  }

  // Merge duplicate lines.
  const quantities = new Map<number, number>();
  for (const i of input.items) quantities.set(i.productId, (quantities.get(i.productId) ?? 0) + i.quantity);

  let order;
  try {
    order = await db.transaction(async (tx) => {
      // Prices always come from the database, never the browser.
      const products = await tx
        .select()
        .from(schema.products)
        .where(and(inArray(schema.products.id, [...quantities.keys()]), eq(schema.products.active, true)));
      if (products.length !== quantities.size) throw new OutOfStock("Some items are no longer available.");

      for (const p of products) {
        const qty = quantities.get(p.id)!;
        const updated = await tx
          .update(schema.products)
          .set({ stock: sql`${schema.products.stock} - ${qty}` })
          .where(and(eq(schema.products.id, p.id), gte(schema.products.stock, qty)))
          .returning({ id: schema.products.id });
        if (!updated.length) {
          throw new OutOfStock(
            p.stock > 0 ? `Only ${p.stock} × ${p.name} left in stock.` : `${p.name} has just sold out.`,
          );
        }
      }

      const subtotalCents = products.reduce((sum, p) => sum + p.priceCents * quantities.get(p.id)!, 0);
      const deliveryCents = deliveryFee(subtotalCents, input.fulfilment);
      const customer = await upsertCustomer(tx, input);
      const [created] = await tx
        .insert(schema.orders)
        .values({
          reference: reference("OR"),
          customerId: customer.id,
          fulfilment: input.fulfilment,
          address,
          subtotalCents,
          deliveryCents,
          totalCents: subtotalCents + deliveryCents,
          notes: input.notes,
        })
        .returning();
      await tx.insert(schema.orderItems).values(
        products.map((p) => ({
          orderId: created.id,
          productId: p.id,
          name: p.name,
          unitPriceCents: p.priceCents,
          quantity: quantities.get(p.id)!,
        })),
      );
      return {
        ...created,
        lines: products.map(
          (p) => `${quantities.get(p.id)} × ${p.name} — ${money(p.priceCents * quantities.get(p.id)!)}`,
        ),
      };
    });
  } catch (err) {
    if (err instanceof OutOfStock) return { error: err.message };
    throw err;
  }

  updateTag(TAGS.products); // stock levels changed

  const summary = [
    `Order: ${order.reference}`,
    ...order.lines,
    `Delivery: ${money(order.deliveryCents)}`,
    `Total: ${money(order.totalCents)}`,
    order.fulfilment === "pickup"
      ? "Collection: in-store pickup"
      : `Deliver to: ${Object.values(address!).filter(Boolean).join(", ")}`,
  ].join("\n");

  await Promise.all([
    sendEmail({
      to: input.email,
      subject: `Order received — ${order.reference}`,
      text: `Hi ${input.name},\n\nThank you for your order with ${site.name}!\n\n${summary}\n\nWe'll be in touch with payment details and let you know when it's on its way.\n\n${site.name}`,
    }),
    notifySalon(
      `New order ${order.reference} — ${money(order.totalCents)}`,
      `${summary}\nCustomer: ${input.name}, ${input.phone}, ${input.email}`,
    ),
  ]);

  redirect(`/order/${order.reference}?new=1`);
}
