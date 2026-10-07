import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StockBadge } from "@/components/stock-badge";
import { getProduct } from "@/lib/catalog";
import { money } from "@/lib/format";
import { AddToCart } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <div className="container-x py-12">
      <Link href="/shop" className="text-sm text-muted hover:text-ink">
        ← Back to shop
      </Link>
      <Suspense fallback={<p className="mt-8 text-muted">Loading…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <ProductGallery images={product.images} name={product.name} />
      <div>
        {product.category && <p className="eyebrow mb-2">{product.category.name}</p>}
        <h1 className="text-4xl font-semibold sm:text-5xl">{product.name}</h1>
        <p className="mt-4 text-2xl">{money(product.priceCents)}</p>
        <StockBadge stock={product.stock} className="mt-2" />
        <div className="mt-6 whitespace-pre-line text-muted">{product.description}</div>
        <div className="mt-8">
          <AddToCart
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              image: product.images[0] ?? null,
              maxQuantity: product.stock,
            }}
          />
        </div>
        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <li>Delivery across South Africa, or free in-store pickup.</li>
          <li>Questions about this product? Ask our team at your next visit.</li>
        </ul>
      </div>
    </div>
  );
}
