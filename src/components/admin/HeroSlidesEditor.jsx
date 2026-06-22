"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { compressImageForUpload } from "@/lib/compress-image";
import { prepareAndUploadImage } from "@/lib/cloudinary-client";
import { MAX_HERO_SLIDES } from "@/lib/constants";
import { normalizeProductImageSrc } from "@/lib/product-images";

const emptyForm = {
  title: "",
  description: "",
  ctaLabel: "Shop collection",
  ctaHref: "/shop",
  image: "",
  alt: "",
  sortOrder: 1,
  active: true,
};

export default function HeroSlidesEditor() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadSlides() {
    const res = await fetch("/api/admin/hero-slides", { cache: "no-store" });
    const data = await res.json();
    setSlides(data.slides || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSlides();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function resetForm() {
    setForm({
      ...emptyForm,
      sortOrder: slides.length + 1,
    });
    setEditingId(null);
    setError("");
  }

  function startEdit(slide) {
    setEditingId(slide.id);
    setForm({
      title: slide.title || "",
      description: slide.description || "",
      ctaLabel: slide.ctaLabel || "Shop collection",
      ctaHref: slide.ctaHref || "/shop",
      image: slide.image || "",
      alt: slide.alt || "",
      sortOrder: slide.sortOrder ?? 1,
      active: slide.active !== false,
    });
    setError("");
  }

  async function uploadImage(file) {
    if (!file?.type?.startsWith("image/")) return;
    setUploading(true);
    setError("");
    try {
      const result = await prepareAndUploadImage(file, {
        folder: "mounis-maguva/hero",
        prepare: compressImageForUpload,
      });
      const url = normalizeProductImageSrc(result.url, null);
      if (url) {
        setForm((prev) => ({
          ...prev,
          image: url,
          alt: prev.alt || prev.title || "Hero slide",
        }));
      }
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveSlide(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.image.trim()) {
      setError("Title and hero image are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/admin/hero-slides/${editingId}`
        : "/api/admin/hero-slides";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not save hero slide");
      }
      await loadSlides();
      resetForm();
    } catch (saveError) {
      setError(saveError.message || "Could not save hero slide");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlide(id) {
    if (!window.confirm("Delete this hero slide?")) return;
    await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    loadSlides();
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Hero Section
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage homepage carousel images and text. Up to {MAX_HERO_SLIDES} slides.
          When empty, default hero images are used.
        </p>
      </div>

      <form
        onSubmit={saveSlide}
        className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-4"
      >
        <p className="text-sm font-medium">
          {editingId ? "Edit hero slide" : "Add hero slide"}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="input-field"
            placeholder="Headline"
            value={form.title}
            onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
            required
          />
          <input
            className="input-field"
            placeholder="Image alt text"
            value={form.alt}
            onChange={(e) => setForm((v) => ({ ...v, alt: e.target.value }))}
          />
          <textarea
            className="input-field md:col-span-2"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Button label"
            value={form.ctaLabel}
            onChange={(e) => setForm((v) => ({ ...v, ctaLabel: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Button link (e.g. /shop/sarees)"
            value={form.ctaHref}
            onChange={(e) => setForm((v) => ({ ...v, ctaHref: e.target.value }))}
          />
          <input
            className="input-field"
            type="number"
            min={1}
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((v) => ({ ...v, sortOrder: Number(e.target.value || 1) }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((v) => ({ ...v, active: e.target.checked }))}
            />
            Show on homepage
          </label>
        </div>

        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4">
          <p className="text-sm font-medium">Hero image</p>
          {form.image ? (
            <div className="relative mt-3 aspect-[4/5] max-w-xs overflow-hidden rounded-lg bg-[var(--color-surface)]">
              <Image
                src={form.image}
                alt={form.alt || form.title || "Hero preview"}
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
          ) : (
            <p className="mt-2 text-xs text-[var(--color-muted)]">No image selected yet.</p>
          )}
          <input
            className="mt-3 block w-full text-sm"
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = "";
            }}
          />
          {uploading && (
            <p className="mt-2 text-xs text-[var(--color-muted)]">Uploading to Cloudinary…</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button className="admin-btn-primary" type="submit" disabled={saving || uploading}>
            {saving ? "Saving…" : editingId ? "Update slide" : "Add slide"}
          </button>
          {editingId && (
            <button type="button" className="admin-btn-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">Current hero slides ({slides.length})</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="overflow-hidden rounded-lg border border-[var(--color-border)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--color-surface)]">
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.alt || slide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 320px"
                  />
                )}
                {!slide.active && (
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Hidden
                  </span>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="line-clamp-2 text-sm font-semibold">{slide.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  Order {slide.sortOrder} · {slide.ctaLabel}
                </p>
                <div className="flex items-center gap-0.5 text-xs">
                  <button
                    type="button"
                    className="admin-action-link"
                    onClick={() => startEdit(slide)}
                  >
                    Edit
                  </button>
                  <span className="px-1 text-[var(--color-border)]" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    className="admin-action-danger"
                    onClick={() => removeSlide(slide.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!slides.length && (
          <p className="text-sm text-[var(--color-muted)]">
            No custom slides yet. The homepage uses built-in default hero images.
          </p>
        )}
      </div>
    </section>
  );
}
