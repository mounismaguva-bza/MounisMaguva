"use client";

import { useEffect, useState } from "react";

export default function AdminOffersPage() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    href: "/shop",
    placement: "home",
    sortOrder: 1,
    isActive: true,
  });

  async function loadData() {
    const [bRes, pRes] = await Promise.all([
      fetch("/api/admin/banners", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
    ]);
    const [bData, pData] = await Promise.all([bRes.json(), pRes.json()]);
    setBanners(bData.banners || []);
    setProducts(pData.products || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createBanner(event) {
    event.preventDefault();
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bannerForm),
    });
    setBannerForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      href: "/shop",
      placement: "home",
      sortOrder: 1,
      isActive: true,
    });
    loadData();
  }

  async function toggleFeatured(product, key) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        [key]: !product[key],
      }),
    });
    loadData();
  }

  return (
    <section className="space-y-5">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
        Offers Management
      </h1>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="text-sm font-medium">Create Marketing Banner</p>
        <form onSubmit={createBanner} className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="input-field" placeholder="Title" value={bannerForm.title} onChange={(e) => setBannerForm((v) => ({ ...v, title: e.target.value }))} required />
          <input className="input-field" placeholder="Subtitle" value={bannerForm.subtitle} onChange={(e) => setBannerForm((v) => ({ ...v, subtitle: e.target.value }))} />
          <input className="input-field" placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm((v) => ({ ...v, imageUrl: e.target.value }))} required />
          <input className="input-field" placeholder="Target href" value={bannerForm.href} onChange={(e) => setBannerForm((v) => ({ ...v, href: e.target.value }))} />
          <select className="input-field" value={bannerForm.placement} onChange={(e) => setBannerForm((v) => ({ ...v, placement: e.target.value }))}>
            <option value="home">Home</option>
            <option value="collections">Collections</option>
          </select>
          <input className="input-field" type="number" placeholder="Sort order" value={bannerForm.sortOrder} onChange={(e) => setBannerForm((v) => ({ ...v, sortOrder: Number(e.target.value || 0) }))} />
          <button className="admin-btn-primary md:col-span-2 md:w-fit" type="submit">
            Save banner
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">Active banners</p>
        <div className="space-y-2">
          {banners.map((banner) => (
            <div key={banner.id} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm font-semibold">{banner.title}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {banner.placement} · {banner.href}
              </p>
            </div>
          ))}
          {!banners.length && <p className="text-sm text-[var(--color-muted)]">No banners yet.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">Featured product flags</p>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm">{product.name}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={`admin-btn-toggle ${product.isNew ? "admin-btn-toggle-active" : ""}`}
                  onClick={() => toggleFeatured(product, "isNew")}
                >
                  {product.isNew ? "New ✓" : "Mark New"}
                </button>
                <button
                  type="button"
                  className={`admin-btn-toggle ${product.isBestSeller ? "admin-btn-toggle-active" : ""}`}
                  onClick={() => toggleFeatured(product, "isBestSeller")}
                >
                  {product.isBestSeller ? "Best Seller ✓" : "Mark Best Seller"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
