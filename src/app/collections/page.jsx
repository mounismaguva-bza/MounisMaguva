import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import CollectionCategoryCard from "@/components/collections/CollectionCategoryCard";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { getImageOverrideMap } from "@/lib/media-overrides";
import { categories, site } from "@/lib/site";
import { getNewArrivals } from "@/lib/products";

export const metadata = {
  title: "Collections",
  description: "Explore curated ethnic wear collections from Maguva Ethnics.",
};

const occasions = [
  { label: "3 Piece Sets", href: "/shop/three-piece-sets" },
  { label: "Festive Sarees", href: "/shop/sarees" },
  { label: "Daily Kurtis", href: "/shop/kurtis" },
  { label: "Indo-Western", href: "/shop/dresses" },
  { label: "New Arrivals", href: "/shop/new-arrivals" },
];

export default async function CollectionsPage() {
  const [highlights, imageMap] = await Promise.all([
    getNewArrivals(8),
    getImageOverrideMap(),
  ]);
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const sarees = bySlug["sarees"];
  const threePieceSets = bySlug["three-piece-sets"];
  const dresses = bySlug["dresses"];
  const kurtis = bySlug["kurtis"];
  const dupattas = bySlug["dupattas"];
  const newArrivals = bySlug["new-arrivals"];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={imageMap["fashionImages.collectionsBanner"]}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)]/95 to-[var(--color-primary)]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-gold)]">
                <Sparkles className="size-3.5" />
                Curated for you
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Our Collections
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                From 3 piece sets to everyday kurtis — every piece is chosen for fabric,
                drape, and how it photographs on {site.instagramHandle}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="brand" size="pill" className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-gold)] hover:text-[var(--color-text)]" render={<Link href="/shop" />}>
                  Shop all
                </Button>
                <Button variant="brandOutline" size="pill" className="border-white text-white hover:bg-white hover:text-[var(--color-primary)]" render={<Link href="/shop/new-arrivals" />}>
                  New arrivals
                </Button>
              </div>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl lg:max-w-none">
              <Image
                src={imageMap["fashionImages.sareeRed"]}
                alt="Curated ethnic wear collection"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by occasion */}
      <section className="border-b border-[var(--color-border)] bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Shop by occasion
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {occasions.map((item) => (
              <Button
                key={item.href}
                variant="outline"
                size="sm"
                className="rounded-full border-[var(--color-border)] px-4 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                render={<Link href={item.href} />}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento category grid */}
      <section className="section-padding bg-[var(--color-cream)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Browse by category</h2>
              <p className="section-subtitle mt-2 max-w-xl">
                Six curated edits — tap a collection to explore every style in that category.
              </p>
            </div>
            <Button variant="link" className="text-[var(--color-primary)] p-0 h-auto" render={<Link href="/shop" />}>
              View full catalogue →
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-3 md:gap-5 md:min-h-[640px]">
            <CollectionCategoryCard
              href={`/shop/${sarees.slug}`}
              name={sarees.name}
              description={sarees.description}
              image={sarees.image}
              count={sarees.count}
              size="large"
              className="col-span-2 row-span-2 md:col-span-2 md:row-span-2"
            />
            {threePieceSets ? (
              <CollectionCategoryCard
                href={`/shop/${threePieceSets.slug}`}
                name={threePieceSets.name}
                description={threePieceSets.description}
                image={threePieceSets.image}
                count={threePieceSets.count}
                size="medium"
                className="col-span-2 md:col-span-2 md:row-span-1"
              />
            ) : null}
            <CollectionCategoryCard
              href={`/shop/${dresses.slug}`}
              name={dresses.name}
              description={dresses.description}
              image={dresses.image}
              count={dresses.count}
              size="medium"
              className="col-span-2 md:col-span-2"
            />
            <CollectionCategoryCard
              href={`/shop/${kurtis.slug}`}
              name={kurtis.name}
              description={kurtis.description}
              image={kurtis.image}
              count={kurtis.count}
              className="col-span-1"
            />
            <CollectionCategoryCard
              href={`/shop/${dupattas.slug}`}
              name={dupattas.name}
              description={dupattas.description}
              image={dupattas.image}
              count={dupattas.count}
              className="col-span-1"
            />
            <CollectionCategoryCard
              href={`/shop/${newArrivals.slug}`}
              name={newArrivals.name}
              description={newArrivals.description}
              image={newArrivals.image}
              count={newArrivals.count}
              className="col-span-2 md:col-span-2"
            />
          </div>
        </div>
      </section>

      {/* Studio highlights */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Studio highlights</h2>
              <p className="section-subtitle mt-2">
                Fresh picks from our latest shoot — add to bag and order on WhatsApp.
              </p>
            </div>
            <Button variant="brandOutline" size="pill-sm" render={<Link href="/shop/new-arrivals" />}>
              See all new
            </Button>
          </div>
          <ProductGrid products={highlights} />
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-[var(--color-surface)] p-8 text-center sm:p-12 lg:flex lg:items-center lg:justify-between lg:text-left lg:gap-10">
            <div className="lg:max-w-xl">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)] sm:text-3xl">
                See the full lookbook on Instagram
              </h2>
              <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                New drops, styling reels, and customer photos live on {site.instagramHandle}.
                Follow us for updates before pieces sell out.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
              <Button variant="brand" size="pill" render={<a href={site.instagram} target="_blank" rel="noopener noreferrer" />}>
                Follow {site.instagramHandle}
              </Button>
              <Button variant="outline" size="pill" render={<Link href="/contact" />}>
                Contact us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
