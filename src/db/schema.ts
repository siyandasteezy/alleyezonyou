import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// All money is stored in cents (ZAR) to avoid floating point errors.

export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "completed", "cancelled"]);

export const orderStatus = pgEnum("order_status", ["pending", "paid", "ready", "shipped", "completed", "cancelled"]);

export const fulfilment = pgEnum("fulfilment", ["delivery", "pickup"]);

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("customers_email_idx").on(t.email)],
);

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  durationMins: integer("duration_mins").notNull(),
  priceCents: integer("price_cents").notNull(),
  // Shown as "from R…" when the final price depends on hair length etc.
  priceFrom: boolean("price_from").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const stylists = pgTable("stylists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Stylist"),
  bio: text("bio").notNull().default(""),
  imageUrl: text("image_url"),
  // How many clients this stylist can take in the same time slot.
  capacity: integer("capacity").notNull().default(1),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const stylistServices = pgTable(
  "stylist_services",
  {
    stylistId: integer("stylist_id")
      .notNull()
      .references(() => stylists.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.stylistId, t.serviceId] })],
);

// Weekly working hours. weekday: 0 = Sunday … 6 = Saturday. Times are "HH:MM" salon-local.
export const stylistHours = pgTable(
  "stylist_hours",
  {
    id: serial("id").primaryKey(),
    stylistId: integer("stylist_id")
      .notNull()
      .references(() => stylists.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
  },
  (t) => [index("stylist_hours_stylist_idx").on(t.stylistId)],
);

// Whole days a stylist is unavailable (leave, training, public holidays). date: "YYYY-MM-DD".
export const stylistTimeOff = pgTable(
  "stylist_time_off",
  {
    id: serial("id").primaryKey(),
    stylistId: integer("stylist_id")
      .notNull()
      .references(() => stylists.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    reason: text("reason").notNull().default(""),
  },
  (t) => [uniqueIndex("stylist_time_off_idx").on(t.stylistId, t.date)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    stylistId: integer("stylist_id")
      .notNull()
      .references(() => stylists.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: bookingStatus("status").notNull().default("pending"),
    priceCents: integer("price_cents").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("bookings_stylist_time_idx").on(t.stylistId, t.startsAt)],
);

export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").references(() => productCategories.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DeliveryAddress = {
  line1: string;
  line2?: string;
  suburb: string;
  city: string;
  postalCode: string;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  fulfilment: fulfilment("fulfilment").notNull(),
  address: jsonb("address").$type<DeliveryAddress | null>(),
  subtotalCents: integer("subtotal_cents").notNull(),
  deliveryCents: integer("delivery_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: orderStatus("status").notNull().default("pending"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  // Snapshot of the product at time of purchase.
  name: text("name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
  orders: many(orders),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  stylists: many(stylistServices),
}));

export const stylistsRelations = relations(stylists, ({ many }) => ({
  services: many(stylistServices),
  hours: many(stylistHours),
  timeOff: many(stylistTimeOff),
}));

export const stylistServicesRelations = relations(stylistServices, ({ one }) => ({
  stylist: one(stylists, { fields: [stylistServices.stylistId], references: [stylists.id] }),
  service: one(services, { fields: [stylistServices.serviceId], references: [services.id] }),
}));

export const stylistHoursRelations = relations(stylistHours, ({ one }) => ({
  stylist: one(stylists, { fields: [stylistHours.stylistId], references: [stylists.id] }),
}));

export const stylistTimeOffRelations = relations(stylistTimeOff, ({ one }) => ({
  stylist: one(stylists, { fields: [stylistTimeOff.stylistId], references: [stylists.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(customers, { fields: [bookings.customerId], references: [customers.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  stylist: one(stylists, { fields: [bookings.stylistId], references: [stylists.id] }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export type BookingStatus = (typeof bookingStatus.enumValues)[number];
export type OrderStatus = (typeof orderStatus.enumValues)[number];
