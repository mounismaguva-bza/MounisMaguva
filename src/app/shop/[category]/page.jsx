import ProductCacheWarmer from "@/components/shop/ProductCacheWarmer";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { categories } from "@/lib/site";
import { getProductsByCategory } from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Shop" };
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryShopPage({ params }) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const items = await getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <nav className="text-xs text-[var(--color-muted)] mb-4">
        <Link href="/shop" className="hover:text-[var(--color-primary)]">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span>{cat.name}</span>
      </nav>

      <div className="mb-10">
        <h1 className="section-title">{cat.name}</h1>
        <p className="section-subtitle mt-2">{cat.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/shop"
          className="px-4 py-2 text-sm rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)]"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              c.slug === category
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <ProductCacheWarmer products={items} />
      <ShopCatalog
        products={items}
        emptyMessage={`No ${cat.name.toLowerCase()} available right now. Check back soon!`}
      />
    </div>
  );
}
