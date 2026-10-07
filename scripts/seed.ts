// Placeholder catalogue so every page has something to show.
// Replace with the spa's real services, team and products (or manage them in /admin).
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { db, schema } = await import("../src/db");
  const { sql } = await import("drizzle-orm");
  const { slugify } = await import("../src/lib/format");

  await db.execute(sql`truncate table
    order_items, orders, bookings, stylist_time_off, stylist_hours, stylist_services,
    stylists, services, products, product_categories, customers
    restart identity cascade`);

  const services = await db
    .insert(schema.services)
    .values(
      [
        ["Wash & Blow Dry", "Hair", 60, 25000, false, "Shampoo, condition and a smooth blow-out."],
        ["Silk Press", "Hair", 120, 55000, true, "Deep cleanse, treatment and a glossy silk press."],
        ["Relaxer & Style", "Hair", 150, 65000, true, "Relaxer application with treatment and style."],
        ["Cut & Style", "Hair", 60, 35000, false, "Precision cut finished with a style of your choice."],
        ["Colour", "Hair", 150, 80000, true, "Full colour or highlights. Consultation included."],
        ["Knotless Braids", "Braids", 300, 90000, true, "Medium knotless braids, mid-back length."],
        ["Cornrows", "Braids", 120, 40000, true, "Straight-back or freestyle cornrows."],
        ["Wig Install", "Wigs", 120, 60000, false, "Frontal or closure install with styling."],
        ["Lash Extensions", "Lashes & Brows", 90, 45000, false, "Classic full set."],
        ["Brow Shape & Tint", "Lashes & Brows", 30, 15000, false, "Wax, tweeze and tint."],
      ].map(([name, category, durationMins, priceCents, priceFrom, description], i) => ({
        name: name as string,
        slug: slugify(name as string),
        category: category as string,
        durationMins: durationMins as number,
        priceCents: priceCents as number,
        priceFrom: priceFrom as boolean,
        description: description as string,
        sortOrder: i,
      })),
    )
    .returning();

  const stylists = await db
    .insert(schema.stylists)
    .values([
      {
        name: "Stylist One",
        role: "Owner & Senior Stylist",
        bio: "Placeholder bio — colour and silk press specialist.",
        sortOrder: 0,
      },
      {
        name: "Stylist Two",
        role: "Braider",
        bio: "Placeholder bio — braids and protective styles.",
        capacity: 1,
        sortOrder: 1,
      },
      {
        name: "Stylist Three",
        role: "Lash & Brow Artist",
        bio: "Placeholder bio — lashes, brows and wig installs.",
        sortOrder: 2,
      },
    ])
    .returning();

  const byCategory = (c: string) => services.filter((s) => s.category === c).map((s) => s.id);
  const assignments: [number, number[]][] = [
    [stylists[0].id, [...byCategory("Hair"), ...byCategory("Wigs")]],
    [stylists[1].id, [...byCategory("Braids"), ...byCategory("Wigs")]],
    [stylists[2].id, [...byCategory("Lashes & Brows"), ...byCategory("Wigs")]],
  ];
  await db
    .insert(schema.stylistServices)
    .values(assignments.flatMap(([stylistId, ids]) => ids.map((serviceId) => ({ stylistId, serviceId }))));

  // Tue–Fri 08:00–18:00, Sat 08:00–16:00
  await db
    .insert(schema.stylistHours)
    .values(
      stylists.flatMap((s) => [
        ...[2, 3, 4, 5].map((weekday) => ({ stylistId: s.id, weekday, startTime: "08:00", endTime: "18:00" })),
        { stylistId: s.id, weekday: 6, startTime: "08:00", endTime: "16:00" },
      ]),
    );

  const categories = await db
    .insert(schema.productCategories)
    .values(
      ["Hair Care", "Styling", "Treatments", "Tools & Accessories"].map((name, i) => ({
        name,
        slug: slugify(name),
        sortOrder: i,
      })),
    )
    .returning();
  const cat = (name: string) => categories.find((c) => c.name === name)!.id;

  await db.insert(schema.products).values(
    (
      [
        ["Moisture Shampoo 300ml", "Hair Care", 18900, 24],
        ["Hydrating Conditioner 300ml", "Hair Care", 19900, 18],
        ["Edge Control", "Styling", 8900, 40],
        ["Heat Protect Spray", "Styling", 15900, 3],
        ["Deep Repair Mask", "Treatments", 24900, 12],
        ["Scalp Growth Oil", "Treatments", 17900, 0],
        ["Satin Bonnet", "Tools & Accessories", 12900, 30],
        ["Wide Tooth Comb", "Tools & Accessories", 4900, 50],
      ] as const
    ).map(([name, category, priceCents, stock]) => ({
      name,
      slug: slugify(name),
      categoryId: cat(category),
      priceCents,
      stock,
      description: "Placeholder product description. Replace with the real product details.",
    })),
  );

  console.log(`Seeded ${services.length} services, ${stylists.length} stylists, 8 products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
