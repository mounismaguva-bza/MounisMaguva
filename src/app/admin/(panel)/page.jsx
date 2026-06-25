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
    { label: "Products", value: products },
    { label: "Orders", value: orders },
    { label: "Offers", value: banners },
    { label: "Coupons", value: coupons },
    { label: "Images", value: media },
  ];

  return (
    <section className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-primary)]">
        Admin Dashboard
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Manage products, WhatsApp orders, offers, coupons, and images.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--color-border)] bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
