import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/admin-ui";
import { SubmitButton } from "@/components/confirm-button";
import { db, schema } from "@/db";
import { addCategory, deleteProduct } from "../../../actions";
import { ProductForm } from "./product-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit product" };

// Handles both /admin/products/new and /admin/products/:id
export default async function ProductEditPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const [product, categories] = await Promise.all([
    isNew
      ? null
      : db.query.products.findFirst({ where: eq(schema.products.id, Number(id) || 0) }).then((p) => p ?? null),
    db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.sortOrder)),
  ]);
  if (!isNew && !product) notFound();

  return (
    <>
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">
        ← All products
      </Link>
      <PageHeader title={product ? product.name : "New product"}>
        {product && (
          <>
            <Link href={`/shop/${product.slug}`} target="_blank" className="btn-outline">
              View in shop ↗
            </Link>
            <form action={deleteProduct.bind(null, product.id)}>
              <SubmitButton
                className="btn-ghost text-danger"
                confirm="Remove this product? (Products with past orders are hidden instead.)"
              >
                Remove
              </SubmitButton>
            </form>
          </>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ProductForm
          categories={categories}
          product={
            product && {
              id: product.id,
              name: product.name,
              categoryId: product.categoryId,
              price: (product.priceCents / 100).toFixed(2),
              stock: product.stock,
              description: product.description,
              images: product.images.join("\n"),
              active: product.active,
            }
          }
        />
        <form action={addCategory} className="card h-fit space-y-3 p-5">
          <h2 className="text-lg font-semibold">Add a category</h2>
          <input name="name" placeholder="e.g. Wigs" className="input" required minLength={2} />
          <SubmitButton className="btn-outline w-full">Add category</SubmitButton>
        </form>
      </div>
    </>
  );
}
