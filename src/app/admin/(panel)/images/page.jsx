"use client";

import { useEffect, useState } from "react";

const imageAliases = [
  "fashionImages.sareeRed",
  "fashionImages.sareeDrape",
  "fashionImages.sareeGold",
  "fashionImages.sareePink",
  "fashionImages.sareeLavender",
  "fashionImages.lehengaBridal",
  "fashionImages.lehengaFestive",
  "fashionImages.lehengaParty",
  "fashionImages.dressGown",
  "fashionImages.dressAnarkali",
  "fashionImages.kurtiIndigo",
  "fashionImages.kurtiPeach",
  "fashionImages.dupatta",
  "fashionImages.fashionEditorial",
  "fashionImages.hero",
  "fashionImages.collectionsBanner",
];

export default function AdminImagesPage() {
  const [media, setMedia] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [alias, setAlias] = useState(imageAliases[0]);
  const [url, setUrl] = useState("");

  async function loadData() {
    const [mRes, oRes] = await Promise.all([
      fetch("/api/admin/media", { cache: "no-store" }),
      fetch("/api/admin/media-overrides", { cache: "no-store" }),
    ]);
    const [mData, oData] = await Promise.all([mRes.json(), oRes.json()]);
    setMedia(mData.media || []);
    setOverrides(oData.overrides || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function uploadFile(event) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("file");
    const file = input?.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("usageTags", "admin-upload");
    await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    event.currentTarget.reset();
    loadData();
  }

  async function saveOverride(event) {
    event.preventDefault();
    await fetch("/api/admin/media-overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias, url }),
    });
    setUrl("");
    loadData();
  }

  return (
    <section className="space-y-5">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
        Images Management
      </h1>

      <form onSubmit={uploadFile} className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="text-sm font-medium">Upload image</p>
        <input name="file" className="mt-3 block w-full text-sm" type="file" accept="image/*" required />
        <button className="admin-btn-primary mt-3" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <form onSubmit={saveOverride} className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="text-sm font-medium">Set storefront image alias</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select className="input-field" value={alias} onChange={(e) => setAlias(e.target.value)}>
            {imageAliases.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input className="input-field" placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
        </div>
        <button className="admin-btn-primary mt-3" type="submit">
          Save override
        </button>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">Current overrides</p>
        <div className="space-y-2">
          {overrides.map((item) => (
            <div key={item.id} className="rounded-lg border border-[var(--color-border)] p-3 text-xs">
              <p className="font-semibold">{item.alias}</p>
              <p className="truncate text-[var(--color-muted)]">{item.url}</p>
            </div>
          ))}
          {!overrides.length && <p className="text-sm text-[var(--color-muted)]">No overrides set.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">Media library</p>
        <div className="space-y-2">
          {media.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-[var(--color-border)] p-3 text-xs"
            >
              <p className="font-semibold">{item.altText || item.id}</p>
              <p className="mt-1 truncate text-[var(--color-muted)]">{item.url}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
