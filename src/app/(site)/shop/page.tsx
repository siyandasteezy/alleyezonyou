import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/images";
import { getProductCategories, getProducts } from "@/lib/catalog";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getProductCategories()]);
  return (
    <>
      <PageHero eyebrow="The shop" title="Keep the glow" accent="going." photo={photos.skincare}>
        Aftercare and favourites, delivered to your door or collected at your next visit.
      </PageHero>
      <div className="container-x py-16">
        <ShopGrid products={products} categories={categories} />
      </div>
    </>
  );
}
