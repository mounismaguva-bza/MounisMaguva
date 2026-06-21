import Link from "next/link";

export default function OfferBanners({ banners = [] }) {
  if (!banners.length) return null;

  return (
    <section className="bg-white py-5">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:px-6 lg:px-8 md:grid-cols-2">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href || "/shop"}
            className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] p-4 transition-colors hover:border-[var(--color-primary)]"
          >
            <p className="text-sm font-semibold text-[var(--color-primary)]">{banner.title}</p>
            {banner.subtitle ? (
              <p className="mt-1 text-xs text-[var(--color-muted)]">{banner.subtitle}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
