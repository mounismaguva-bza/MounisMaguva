import ProductCacheWarmer from "@/components/shop/ProductCacheWarmer";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { categories } from "@/lib/site";
import { getAllProducts } from "@/lib/products";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Ethnic Wear — Sarees, Kurtis & 3 Piece Sets",
  description: "Browse the best sarees, 3 piece sets, dresses, kurtis and dupattas. Handpicked ethnic wear with free shipping across India.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-10 text-center">
        <h1 className="section-title">Shop All</h1>
        <p className="section-subtitle mx-auto mt-2">
          {products.length} styles across our ethnic wear collection
        </p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop/${cat.slug}`}
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm capitalize transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <ProductCacheWarmer products={products} />
      <ShopCatalog products={products} />
    </div>
  );
}
