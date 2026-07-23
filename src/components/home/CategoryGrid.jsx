import Image from "next/image";
import Link from "next/link";
import { categories, categoryPromos } from "@/lib/site";

const FRAME_GOLD = "#d4af37";

function categoryLabel(promo) {
  const match = categories.find((c) => c.slug === promo.slug);
  return match?.name || promo.title;
}

function ArchCategoryFrame({ promo }) {
  const label = categoryLabel(promo);

  return (
    <Link
      href={promo.href}
      className="group relative mx-auto flex w-full max-w-[280px] flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      aria-label={`Shop ${label}`}
    >
      {/* Arched image frame */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-black transition-transform duration-500 ease-out group-hover:-translate-y-1"
        style={{
          borderRadius: "9999px 9999px 0 0",
          border: `2px solid ${FRAME_GOLD}`,
          borderBottomWidth: 2,
        }}
      >
        <Image
          src={promo.image}
          alt={label}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 639px) 70vw, (max-width: 1023px) 30vw, 280px"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 opacity-80 transition-opacity duration-500 group-hover:opacity-50"
          aria-hidden
        />
      </div>

      {/* Label plaque — overlaps arch base */}
      <div
        className="relative z-10 -mt-5 w-[78%] bg-black px-3 py-2.5 text-center transition-colors duration-300 group-hover:bg-[var(--color-primary-dark)] sm:-mt-6 sm:py-3"
        style={{ border: `2px solid ${FRAME_GOLD}` }}
      >
        <span
          className="font-[family-name:var(--font-display)] text-sm tracking-wide sm:text-base"
          style={{ color: FRAME_GOLD }}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

export default function CategoryGrid() {
  return (
    <section className="bg-[var(--color-primary)] py-10 sm:section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] text-[#f0e6c8] sm:text-3xl md:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-2 max-w-xl px-2 text-sm text-[#f0e6c8]/80 sm:text-base">
            Sarees, 3 piece sets, dresses & more — curated for every occasion
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 justify-items-center gap-10 sm:grid-cols-3 sm:gap-6 md:gap-10 lg:gap-14">
          {categoryPromos.map((promo) => (
            <ArchCategoryFrame key={promo.slug} promo={promo} />
          ))}
        </div>
      </div>
    </section>
  );
}
