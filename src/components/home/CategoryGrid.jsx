import Image from "next/image";
import Link from "next/link";
import { categoryPromos } from "@/lib/site";
import { Button } from "@/components/ui/button";

function ShopNowButton({ className = "" }) {
  return (
    <Button variant="promo" size="pill-sm" className={className}>
      Shop Now
    </Button>
  );
}

/** Left text panel + image (stacks on mobile). */
function HorizontalPromoCard({ promo }) {
  return (
    <Link
      href={promo.href}
      className="group flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] sm:min-h-[190px] sm:flex-row"
    >
      <div className="relative z-10 flex flex-col justify-center px-4 py-5 sm:w-[52%] sm:shrink-0 sm:px-6 sm:py-4 md:w-[55%]">
        <p className="text-xs font-semibold text-[var(--color-primary)] sm:text-sm">
          {promo.discount}
        </p>
        <h3 className="mt-1 text-base font-bold leading-snug text-gray-900 sm:text-lg md:text-xl">
          {promo.title}
        </h3>
        <ShopNowButton className="mt-4 w-fit" />
      </div>
      <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:min-h-[190px] sm:flex-1 md:min-h-[210px]">
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 300px"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-8 bg-gradient-to-b from-[var(--color-surface)] to-transparent sm:inset-y-0 sm:left-0 sm:h-auto sm:w-12 sm:bg-gradient-to-r md:w-14"
          aria-hidden
        />
      </div>
    </Link>
  );
}

/** Tall featured card — full image with text on top. */
function FeaturedPromoCard({ promo }) {
  return (
    <Link
      href={promo.href}
      className="group relative block min-h-[300px] overflow-hidden rounded-2xl sm:min-h-[340px] lg:min-h-full"
    >
      <Image
        src={promo.image}
        alt={promo.title}
        fill
        className="object-cover object-[center_70%] transition-transform duration-500 group-hover:scale-105 sm:object-[center_75%]"
        sizes="(max-width: 1023px) 100vw, 50vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-cream)]/95 via-[var(--color-cream)]/50 to-transparent sm:via-[var(--color-cream)]/45"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center px-5 pt-7 pb-5 text-center sm:px-6 sm:pt-10 sm:pb-4">
        <p className="text-xs font-semibold text-[var(--color-primary)] sm:text-sm">
          {promo.discount}
        </p>
        <h3 className="mt-2 max-w-[280px] text-lg font-bold leading-snug text-[var(--color-text)] sm:max-w-[240px] sm:text-xl">
          {promo.title}
        </h3>
        <ShopNowButton className="mt-4 sm:mt-5" />
      </div>
    </Link>
  );
}

export default function CategoryGrid() {
  const horizontalPromos = categoryPromos.filter((p) => p.layout === "horizontal");
  const featuredPromo = categoryPromos.find((p) => p.layout === "featured");

  return (
    <section className="bg-white py-10 sm:section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center sm:mb-8 lg:mb-10">
          <h2 className="section-title text-[1.75rem] sm:text-3xl md:text-4xl">
            Shop by Category
          </h2>
          <p className="section-subtitle mx-auto mt-2 px-2 text-sm sm:text-base">
            Sarees, 3 piece sets, dresses & more — curated for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:min-h-[420px] lg:grid-cols-2">
          <div className="grid gap-4 md:gap-5 lg:grid-rows-2">
            {horizontalPromos.map((promo) => (
              <HorizontalPromoCard key={promo.slug} promo={promo} />
            ))}
          </div>

          {featuredPromo && <FeaturedPromoCard promo={featuredPromo} />}
        </div>
      </div>
    </section>
  );
}
