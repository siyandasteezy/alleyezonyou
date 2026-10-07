"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

type Category = { id: number; name: string; slug: string };

export function ShopGrid({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [active, setActive] = useState<number | null>(null);
  const visible = active ? products.filter((p) => p.categoryId === active) : products;
  const used = categories.filter((c) => products.some((p) => p.categoryId === c.id));

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip active={active === null} onClick={() => setActive(null)}>
          All
        </Chip>
        {used.map((c) => (
          <Chip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-muted">No products here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
