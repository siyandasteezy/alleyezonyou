import { desc, ilike, or, sql } from "drizzle-orm";
import { PageHeader, Table, Td } from "@/components/admin-ui";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const q = String((await searchParams).q ?? "").trim();
  const like = `%${q}%`;

  const customers = await db
    .select({
      id: schema.customers.id,
      name: schema.customers.name,
      email: schema.customers.email,
      phone: schema.customers.phone,
      createdAt: schema.customers.createdAt,
      bookings:
        sql<number>`(select count(*) from ${schema.bookings} where ${schema.bookings.customerId} = ${schema.customers.id})`.mapWith(
          Number,
        ),
      orders:
        sql<number>`(select count(*) from ${schema.orders} where ${schema.orders.customerId} = ${schema.customers.id})`.mapWith(
          Number,
        ),
      lastVisit: sql<Date | null>`(select max(${schema.bookings.startsAt}) from ${schema.bookings} where ${schema.bookings.customerId} = ${schema.customers.id} and ${schema.bookings.status} = 'completed')`,
    })
    .from(schema.customers)
    .where(
      q
        ? or(
            ilike(schema.customers.name, like),
            ilike(schema.customers.email, like),
            ilike(schema.customers.phone, like),
          )
        : undefined,
    )
    .orderBy(desc(schema.customers.createdAt))
    .limit(300);

  return (
    <>
      <PageHeader title="Customers">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search name, email or phone" className="input w-64" />
          <button className="btn-outline">Search</button>
        </form>
      </PageHeader>
      <Table
        head={["Name", "Phone", "Email", "Bookings", "Orders", "Last visit", "Since"]}
        empty={q ? "No customers match." : "No customers yet."}
      >
        {customers.map((c) => (
          <tr key={c.id}>
            <Td className="font-medium">{c.name}</Td>
            <Td className="whitespace-nowrap">
              <a href={`tel:${c.phone}`}>{c.phone}</a>
            </Td>
            <Td>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </Td>
            <Td>{c.bookings}</Td>
            <Td>{c.orders}</Td>
            <Td className="whitespace-nowrap">{c.lastVisit ? formatDate(c.lastVisit) : "—"}</Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(c.createdAt)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
