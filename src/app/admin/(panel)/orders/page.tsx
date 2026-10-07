import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { FilterTabs, PageHeader, Table, Td } from "@/components/admin-ui";
import { StatusBadge } from "@/components/status-badge";
import { db, schema } from "@/db";
import { orderStatus, type OrderStatus } from "@/db/schema";
import { formatDate, money } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter =
    sp.status === "open" ? "open" : (orderStatus.enumValues.find((s) => s === sp.status) as OrderStatus | undefined);

  const orders = await db.query.orders.findMany({
    where:
      filter === "open"
        ? inArray(schema.orders.status, ["pending", "paid", "ready"])
        : filter
          ? eq(schema.orders.status, filter)
          : undefined,
    with: { customer: true, items: true },
    orderBy: desc(schema.orders.createdAt),
    limit: 200,
  });

  return (
    <>
      <PageHeader title="Orders" />
      <FilterTabs
        active={filter ?? "all"}
        items={[
          { key: "all", label: "All", href: "/admin/orders" },
          { key: "open", label: "Needs action", href: "/admin/orders?status=open" },
          ...orderStatus.enumValues.map((s) => ({
            key: s,
            label: s === "ready" ? "Ready for pickup" : s[0].toUpperCase() + s.slice(1),
            href: `/admin/orders?status=${s}`,
          })),
        ]}
      />
      <Table head={["Order", "Customer", "Items", "Total", "Fulfilment", "Status"]} empty="No orders match.">
        {orders.map((o) => (
          <tr key={o.id}>
            <Td>
              <Link href={`/admin/orders/${o.id}`} className="font-medium text-accent hover:underline">
                {o.reference}
              </Link>
              <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
            </Td>
            <Td>
              <p className="font-medium">{o.customer.name}</p>
              <p className="text-xs text-muted">{o.customer.phone}</p>
            </Td>
            <Td>{o.items.reduce((n, i) => n + i.quantity, 0)}</Td>
            <Td className="font-medium">{money(o.totalCents)}</Td>
            <Td className="capitalize">{o.fulfilment}</Td>
            <Td>
              <StatusBadge status={o.status} />
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
