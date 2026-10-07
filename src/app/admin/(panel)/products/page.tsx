import Link from "next/link";
import { asc, lte } from "drizzle-orm";
import { FilterTabs, PageHeader, Table, Td } from "@/components/admin-ui";
import { PlaceholderImage } from "@/components/placeholder-image";
import { LOW_STOCK, StockBadge } from "@/components/stock-badge";
import { db, schema } from "@/db";
import { money } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const low = (await searchParams).stock === "low";
  const products = await db.query.products.findMany({
    where: low ? lte(schema.products.stock, LOW_STOCK) : undefined,
    with: { category: true },
    orderBy: [asc(schema.products.name)],
  });

  return (
    <>
      <PageHeader title="Products">
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </PageHeader>
      <FilterTabs
        active={low ? "low" : "all"}
        items={[
          { key: "all", label: "All products", href: "/admin/products" },
          { key: "low", label: "Low / out of stock", href: "/admin/products?stock=low" },
        ]}
      />
      <Table head={["", "Product", "Category", "Price", "Stock", "Visible"]} empty="No products.">
        {products.map((p) => (
          <tr key={p.id}>
            <Td className="w-14">
              <div className="h-10 w-10 overflow-hidden rounded-md border border-line">
                <PlaceholderImage src={p.images[0]} alt="" label="" />
              </div>
            </Td>
            <Td>
              <Link href={`/admin/products/${p.id}`} className="font-medium text-accent hover:underline">
                {p.name}
              </Link>
            </Td>
            <Td>{p.category?.name ?? "—"}</Td>
            <Td>{money(p.priceCents)}</Td>
            <Td>
              <span className="mr-2 font-medium tabular-nums">{p.stock}</span>
              <StockBadge stock={p.stock} className="inline" />
            </Td>
            <Td>{p.active ? "Yes" : <span className="text-muted">Hidden</span>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
