import ProductCacheWarmer from "@/components/shop/ProductCacheWarmer";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedSection from "@/components/home/FeaturedSection";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import { getBestSellers, getNewArrivals } from "@/lib/products";

export default async function HomePage() {
  const [newArrivals, bestSellers] = await Promise.all([
    getNewArrivals(8),
    getBestSellers(8),
  ]);

  const featuredProducts = [...newArrivals, ...bestSellers].filter(
    (product, index, list) =>
      list.findIndex((item) => item.id === product.id) === index,
  );

  return (
    <>
      <ProductCacheWarmer products={featuredProducts} />
      <Hero />
      <TrustBar />
      <CategoryGrid />
      <FeaturedSection
        title="Latest Arrivals"
        subtitle="Fresh pieces from our studio"
        products={newArrivals}
        viewAllHref="/shop/new-arrivals"
        scroll={false}
      />
      <FeaturedSection
        title="Best Sellers"
        subtitle="Loved by our customers"
        products={bestSellers}
        viewAllHref="/shop"
      />
      {/* <InstagramBanner /> */}
    </>
  );
}
