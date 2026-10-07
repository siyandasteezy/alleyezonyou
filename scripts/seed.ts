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

  // From the spa's price list. Durations are estimates — confirm with the owner.
  const services = await db
    .insert(schema.services)
    .values(
      (
        [
          ["Microblading", "Semi-Permanent Brows", 120, 90000, "Hair-like strokes for natural, fuller brows."],
          ["Ombré Brows", "Semi-Permanent Brows", 150, 120000, "Soft, powdered brow with a gradient finish."],
          ["Combination Brow", "Semi-Permanent Brows", 180, 140000, "Microblading strokes blended with ombré shading."],
          ["Brow Tint & Shape", "Brows", 30, 15000, "Tint and shape to frame your face."],
          ["Henna Tint", "Brows", 45, 30000, "Longer-lasting henna stain for skin and hair."],
          ["Brow Lamination", "Brows", 60, 38000, "Lamination with wax and tint for full, brushed-up brows."],
          ["Classic Lashes", "Lashes", 120, 40000, "One extension per natural lash for a clean, natural look."],
          ["Hybrid Lashes", "Lashes", 150, 50000, "A mix of classic and volume for texture and fullness."],
          ["Volume Lashes", "Lashes", 150, 50000, "Handmade fans for a full, fluffy set."],
          ["Relaxing Back, Neck & Shoulder", "Massages", 30, 20000, "Targeted relief for upper-body tension."],
          ["Full Body Aromatherapy", "Massages", 60, 40000, "Full-body massage with essential oils."],
          ["Full Body Hot Stone", "Massages", 75, 45000, "Heated stones to melt away deep tension."],
          ["Reflexology", "Massages", 45, 25000, "Pressure-point foot therapy."],
          ["Hand / Foot Massage", "Massages", 30, 10000, "A relaxing hand or foot massage."],
          ["Full Body Deep Tissue", "Massages", 60, 45000, "Firm pressure for knots and muscle tension."],
          ["Swedish Massage", "Massages", 60, 30000, "Classic long, flowing strokes to relax the whole body."],
        ] as const
      ).map(([name, category, durationMins, priceCents, description], i) => ({
        name,
        slug: slugify(name),
        category,
        durationMins,
        priceCents,
        description,
        sortOrder: i,
      })),
    )
    .returning();

  // Placeholder team: clients book with the spa and are assigned to whoever is free.
  const stylists = await db
    .insert(schema.stylists)
    .values([
      { name: "Team Member One", role: "Lash & Brow Technician", bio: "Placeholder bio.", sortOrder: 0 },
      { name: "Team Member Two", role: "Massage Therapist", bio: "Placeholder bio.", sortOrder: 1 },
    ])
    .returning();

  const byCategory = (c: string) => services.filter((s) => s.category === c).map((s) => s.id);
  const assignments: [number, number[]][] = [
    [stylists[0].id, [...byCategory("Semi-Permanent Brows"), ...byCategory("Brows"), ...byCategory("Lashes")]],
    [stylists[1].id, byCategory("Massages")],
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
      ["Lash & Brow Care", "Body Care", "Accessories"].map((name, i) => ({
        name,
        slug: slugify(name),
        sortOrder: i,
      })),
    )
    .returning();
  const cat = (name: string) => categories.find((c) => c.name === name)!.id;

  // Placeholder products — replace with what the spa actually sells.
  const img = (id: string) => [`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`];
  const products = (
    [
      ["Lash Growth Serum", "Lash & Brow Care", 29900, 15, "1710410815589-dd83514104d0"],
      ["Lash Extension Cleanser", "Lash & Brow Care", 14900, 20, "1713768704571-6aeb0d0e5105"],
      ["Clear Brow Gel", "Lash & Brow Care", 12900, 3, "1631214540553-ff044a3ff1d4"],
      ["Aromatherapy Massage Oil", "Body Care", 19900, 12, "1671493235081-5842463637cd"],
      ["Exfoliating Body Scrub", "Body Care", 17900, 0, "1786359410261-ec7f89743af6"],
      ["Hydrating Body Butter", "Body Care", 21900, 10, "1762840192336-575fba31d28c"],
      ["Silk Sleep Mask", "Accessories", 14900, 25, "1745670457825-acdabc30498e"],
      ["Lash Spoolie Set", "Accessories", 4900, 50, "1758738880203-8968fb4eda82"],
    ] as const
  ).map(([name, category, priceCents, stock, photo]) => ({
    name,
    slug: slugify(name),
    categoryId: cat(category),
    priceCents,
    stock,
    images: img(photo),
    description: "Placeholder product description. Replace with the real product details.",
  }));
  await db.insert(schema.products).values(products);

  console.log(`Seeded ${services.length} services, ${stylists.length} team members, ${products.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
