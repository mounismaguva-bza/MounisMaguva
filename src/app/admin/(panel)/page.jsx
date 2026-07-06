import Link from "next/link";
import { COLLECTIONS, listCollection } from "@/lib/firestore";

async function getCount(collectionName) {
  try {
    const data = await listCollection(collectionName);
    return data.length;
  } catch {
    return 0;
  }
}

export default async function AdminDashboardPage() {
  const [products, orders, banners, coupons, media] = await Promise.all([
    getCount(COLLECTIONS.products),
    getCount(COLLECTIONS.orders),
    getCount(COLLECTIONS.banners),
    getCount(COLLECTIONS.coupons),
    getCount(COLLECTIONS.media),
  ]);

  const cards = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Orders", value: orders, href: "/admin/orders" },
    { label: "Offers", value: banners, href: "/admin/offers" },
    { label: "Coupons", value: coupons, href: "/admin/coupons" },
    { label: "Images", value: media, href: "/admin/images" },
  ];

  const lastOddCard = cards.length % 2 !== 0;

  return (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)] sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:mt-2">
          Manage products, WhatsApp orders, offers, coupons, and images.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className={[
              "rounded-xl border border-[var(--color-border)] bg-white p-3 transition-colors active:bg-[var(--color-cream)]/70 sm:p-4 sm:hover:bg-[var(--color-cream)]/50",
              lastOddCard && index === cards.length - 1 ? "max-sm:col-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)] sm:text-xs">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-text)] sm:mt-2 sm:text-3xl">
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
