import ProductCacheWarmer from "@/components/shop/ProductCacheWarmer";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { categories } from "@/lib/site";
import { getProductsByCategory } from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

const CATEGORY_SEO = {
  sarees: {
    title: "Buy Sarees Online — Best Silk & Designer Sarees",
    description:
      "Shop the best sarees online — silk, cotton and designer drapes. Handpicked ethnic sarees with free shipping across India.",
  },
  "three-piece-sets": {
    title: "Buy 3 Piece Sets Online — Best Festive & Casual Sets",
    description:
      "Discover the best ready-to-wear 3 piece sets for weddings, festivals and everyday style. Curated ethnic outfits online.",
  },
  dresses: {
    title: "Buy Dresses Online — Best Indo-Western & Ethnic Gowns",
    description:
      "Shop the best indo-western and ethnic dresses online. Elegant gowns and fusion wear for every occasion.",
  },
  kurtis: {
    title: "Buy Kurtis Online — Best Everyday Ethnic Kurtis",
    description:
      "Browse the best kurtis for daily wear and festive occasions. Comfortable, stylish ethnic kurtis with pan-India delivery.",
  },
  dupattas: {
    title: "Buy Dupattas Online — Best Ethnic Dupattas",
    description:
      "Complete your look with the best dupattas — silk, cotton and designer styles to pair with sarees and suits.",
  },
  "new-arrivals": {
    title: "New Arrivals — Latest Ethnic Wear & Best New Styles",
    description:
      "See the latest ethnic wear arrivals — fresh sarees, kurtis and 3 piece sets from our newest collection.",
  },
};

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Shop Ethnic Wear" };
  const seo = CATEGORY_SEO[category];
  return {
    title: seo?.title ?? `Buy ${cat.name} Online`,
    description: seo?.description ?? cat.description,
    alternates: { canonical: `/shop/${category}` },
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
