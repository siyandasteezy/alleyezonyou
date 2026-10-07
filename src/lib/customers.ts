import "server-only";
import { z } from "zod";
import { schema, type Tx } from "@/db";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{8,18}$/, "Please enter a valid phone number"),
});

/** Finds the customer by email, refreshing their name and phone with the latest details. */
export async function upsertCustomer(tx: Tx, contact: z.infer<typeof contactSchema>) {
  const [customer] = await tx
    .insert(schema.customers)
    .values(contact)
    .onConflictDoUpdate({
      target: schema.customers.email,
      set: { name: contact.name, phone: contact.phone },
    })
    .returning();
  return customer;
}

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
