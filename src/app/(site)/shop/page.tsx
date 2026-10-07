import type { Metadata } from "next";
import { SectionHeading } from "@/components/service-menu";
import { getProductCategories, getProducts } from "@/lib/catalog";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getProductCategories()]);
  return (
    <div className="container-x py-16">
      <SectionHeading eyebrow="Shop" title="Spa-quality products">
        Delivered to your door, or collect in-store when you next visit.
      </SectionHeading>
      <ShopGrid products={products} categories={categories} />
    </div>
  );
}
