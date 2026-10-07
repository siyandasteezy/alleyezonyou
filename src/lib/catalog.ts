import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/db";

// Public, shared reads. Cached and invalidated from admin actions via these tags.
export const TAGS = {
  services: "services",
  stylists: "stylists",
  products: "products",
} as const;

export async function getServices() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.services);
  return db
    .select()
    .from(schema.services)
    .where(eq(schema.services.active, true))
    .orderBy(asc(schema.services.sortOrder), asc(schema.services.name));
}

export async function getStylists() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.stylists, TAGS.services);
  const rows = await db.query.stylists.findMany({
    where: eq(schema.stylists.active, true),
    orderBy: [asc(schema.stylists.sortOrder), asc(schema.stylists.name)],
    with: { services: { columns: { serviceId: true } } },
  });
  return rows.map(({ services, ...s }) => ({ ...s, serviceIds: services.map((x) => x.serviceId) }));
}

export async function getProductCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.sortOrder));
}

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return db.query.products.findMany({
    where: eq(schema.products.active, true),
    orderBy: [asc(schema.products.name)],
    with: { category: true },
  });
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.products);
  return (
    (await db.query.products.findFirst({
      where: and(eq(schema.products.slug, slug), eq(schema.products.active, true)),
      with: { category: true },
    })) ?? null
  );
}

export type Service = Awaited<ReturnType<typeof getServices>>[number];
export type Stylist = Awaited<ReturnType<typeof getStylists>>[number];
export type Product = Awaited<ReturnType<typeof getProducts>>[number];
