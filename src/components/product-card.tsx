import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { money } from "@/lib/format";
import { PlaceholderImage } from "./placeholder-image";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-[var(--radius)] border border-line">
        <PlaceholderImage
          src={product.images[0]}
          alt={product.name}
          label="Product image"
          className="transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted">{product.category?.name}</p>
          <p className="font-medium">{product.name}</p>
        </div>
        <p className="text-sm font-medium whitespace-nowrap">{money(product.priceCents)}</p>
      </div>
      <StockBadge stock={product.stock} className="mt-1" />
    </Link>
  );
}
