import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin-auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/images", label: "Images" },
];

export default async function AdminPanelLayout({ children }) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Admin
        </p>
        <p className="mt-1 truncate text-sm text-[var(--color-text)]">
          {admin.name || admin.email}
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-cream)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/auth/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-cream)]"
          >
            Logout
          </button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
