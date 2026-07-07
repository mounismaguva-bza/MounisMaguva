"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/site";
import { slugify } from "@/lib/utils";
import ColorImagesEditor from "@/components/admin/ColorImagesEditor";
import ColorSizesEditor from "@/components/admin/ColorSizesEditor";
import {
  MultiSuggestionField,
  SingleSuggestionField,
} from "@/components/admin/SuggestionField";
import { getColorImagesMap, pruneColorImages } from "@/lib/product-images";
import { sanitizeColorImages, validateColorImages } from "@/lib/sanitize-color-images";

const SIZE_SUGGESTIONS = ["Free Size", "S", "M", "L", "XL", "XXL"];

const FABRIC_SUGGESTIONS = [
  "Pure Silk",
  "Kanjivaram Silk",
  "Cotton",
  "Organza",
  "Georgette",
  "Chiffon",
  "Rayon",
  "Velvet & Net",
  "Cotton Silk",
  "Brocade",
];

const COLOR_SUGGESTIONS = [
  "Maroon & Gold",
  "Emerald Green",
  "Blush Pink",
  "Crimson Red",
  "Ivory",
  "Mustard",
  "Indigo White",
  "Peach",
  "Gold",
  "Lavender",
  "Rose Gold",
  "Teal Blue",
  "Wine Red",
  "Mint Green",
  "Navy Blue",
];

const TAG_SUGGESTIONS = [
  "wedding",
  "silk",
  "festive",
  "party",
  "bridal",
  "cotton",
  "daily-wear",
  "handloom",
  "lightweight",
  "indo-western",
  "embroidered",
  "accessory",
  "sequin",
  "anarkali",
  "office",
];

const defaultValues = {
  name: "",
  sku: "",
  description: "",
  price: "",
  originalPrice: "",
  discountPercent: "",
  category: "sarees",
  fabric: "",
  colors: [],
  colorImages: {},
  colorSizes: {},
  sizes: [],
  tags: [],
  isNew: false,
  isBestSeller: false,
  inStock: true,
};

function normalizeSizes(sizes) {
  if (Array.isArray(sizes)) return sizes.filter(Boolean);
  if (typeof sizes === "string" && sizes.trim()) {
    return sizes.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "string" && tags.trim()) {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function normalizeColors(product) {
  if (Array.isArray(product?.colors) && product.colors.length) {
    return product.colors.filter(Boolean);
  }
  if (Array.isArray(product?.colorOptions) && product.colorOptions.length) {
    return product.colorOptions.map((c) => c.label).filter(Boolean);
  }
  if (product?.color) return [product.color];
  return [];
}

function normalizeColorSizes(product) {
  if (
    product?.colorSizes &&
    typeof product.colorSizes === "object" &&
    !Array.isArray(product.colorSizes)
  ) {
    const map = {};
    Object.entries(product.colorSizes).forEach(([color, sizes]) => {
      const list = Array.isArray(sizes)
        ? sizes.map((s) => String(s).trim()).filter(Boolean)
        : [];
      if (list.length) map[color] = list;
    });
    return map;
  }
  return {};
}

function formatTag(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function parseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function salePriceFromDiscount(originalPrice, discountPercent) {
  const original = parseAmount(originalPrice);
  const discount = parseAmount(discountPercent);
  if (original == null) return "";
  if (discount == null || discount <= 0) return String(Math.round(original));
  const clamped = Math.min(100, discount);
  return String(Math.round(original * (1 - clamped / 100)));
}

function discountFromPrices(originalPrice, salePrice) {
  const original = parseAmount(originalPrice);
  const sale = parseAmount(salePrice);
  if (original == null || sale == null || original <= sale) return "";
  return String(Math.round(((original - sale) / original) * 100));
}

function initialPricing(product) {
  const price = product?.price != null && product.price !== "" ? String(product.price) : "";
  const originalPrice =
    product?.originalPrice != null && product.originalPrice !== ""
      ? String(product.originalPrice)
      : "";
  const discountPercent = discountFromPrices(originalPrice, price);

  return { price, originalPrice, discountPercent };
}

export default function ProductForm({ mode = "create", product }) {
  const router = useRouter();
  const [values, setValues] = useState(() => {
    if (!product) return defaultValues;
    const pricing = initialPricing(product);
    return {
      ...defaultValues,
      ...product,
      ...pricing,
      sizes: normalizeSizes(product.sizes),
      colors: normalizeColors(product),
      colorImages: sanitizeColorImages(getColorImagesMap(product)),
      colorSizes: normalizeColorSizes(product),
      tags: normalizeTags(product.tags),
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const slugPreview = useMemo(() => slugify(values.name), [values.name]);

  function handleOriginalPriceChange(originalPrice) {
    setValues((current) => {
      const next = { ...current, originalPrice };
      if (current.discountPercent !== "") {
        next.price = salePriceFromDiscount(originalPrice, current.discountPercent);
      } else if (originalPrice !== "" && current.price !== "") {
        next.discountPercent = discountFromPrices(originalPrice, current.price);
      }
      return next;
    });
  }

  function handleDiscountPercentChange(discountPercent) {
    const normalized = discountPercent.replace(/[^\d.]/g, "");
    setValues((current) => {
      const next = { ...current, discountPercent: normalized };
      const originalPrice = current.originalPrice || current.price;
      if (originalPrice !== "" && normalized !== "") {
        next.originalPrice = originalPrice;
        next.price = salePriceFromDiscount(originalPrice, normalized);
      } else if (normalized === "" && current.originalPrice !== "") {
        next.price = current.originalPrice;
      }
      return next;
    });
  }

  function handleSalePriceChange(price) {
    setValues((current) => {
      const next = { ...current, price };
      const originalPrice = current.originalPrice || price;
      if (originalPrice !== "" && price !== "") {
        next.originalPrice = current.originalPrice || price;
        next.discountPercent = discountFromPrices(originalPrice, price);
      } else {
        next.discountPercent = "";
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!values.sizes.length) {
      setFormError("Add at least one size.");
      return;
    }
    const colorImages = sanitizeColorImages(
      pruneColorImages(values.colorImages, values.colors),
    );
    if (values.colors.length) {
      const imageError = validateColorImages(colorImages, values.colors);
      if (imageError) {
        setFormError(imageError);
        return;
      }
    }
    setSubmitting(true);
    const payload = {
      name: values.name,
      slug: slugPreview,
      sku: values.sku,
      description: values.description,
      category: values.category,
      fabric: values.fabric,
      colors: values.colors,
      colorImages,
      colorSizes: values.colorSizes,
      sizes: values.sizes,
      tags: values.tags,
      price: Number(values.price || 0),
      originalPrice:
        values.originalPrice &&
        Number(values.originalPrice) > Number(values.price || 0)
          ? Number(values.originalPrice)
          : null,
      isNew: values.isNew,
      isBestSeller: values.isBestSeller,
      inStock: values.inStock,
    };
    const isEdit = mode === "edit";
    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFormError(data.error || "Could not save product.");
      setSubmitting(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-[var(--color-border)] bg-white p-4"
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="product-name">
            Product name
          </label>
          <input
            id="product-name"
            className="input-field"
            placeholder="Banarasi Silk Saree — Royal Maroon"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            required
          />
          {slugPreview ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              URL slug: <code className="text-[var(--color-primary)]">/product/{slugPreview}</code>
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-sku">
              SKU
            </label>
            <input
              id="product-sku"
              className="input-field"
              placeholder="ME-S001"
              value={values.sku}
              onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-category">
              Category
            </label>
            <select
              id="product-category"
              className="input-field"
              value={values.category}
              onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-original-price">
              Original price (₹, MRP)
            </label>
            <input
              id="product-original-price"
              className="input-field"
              type="number"
              min="0"
              step="1"
              value={values.originalPrice}
              onChange={(e) => handleOriginalPriceChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-discount">
              Discount (%)
            </label>
            <input
              id="product-discount"
              className="input-field"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="e.g. 20"
              value={values.discountPercent}
              onChange={(e) => handleDiscountPercentChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-price">
              Sale price (₹)
            </label>
            <input
              id="product-price"
              className="input-field"
              type="number"
              min="0"
              step="1"
              value={values.price}
              onChange={(e) => handleSalePriceChange(e.target.value)}
              required
            />
          </div>
        </div>
        {values.originalPrice &&
        values.price &&
        Number(values.originalPrice) > Number(values.price) ? (
          <p className="text-xs text-[var(--color-muted)]">
            Customer saves ₹
            {Math.round(Number(values.originalPrice) - Number(values.price))} (
            {discountFromPrices(values.originalPrice, values.price)}% off)
          </p>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="product-description">
            Description
          </label>
          <textarea
            id="product-description"
            className="input-field min-h-24"
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </div>

        <SingleSuggestionField
          id="product-fabric"
          label="Fabric"
          value={values.fabric}
          onChange={(fabric) => setValues((v) => ({ ...v, fabric }))}
          suggestions={FABRIC_SUGGESTIONS}
          placeholder="Start typing fabric name..."
        />
      </div>

      <MultiSuggestionField
        legend="Colors"
        placeholder="Start typing color name..."
        suggestions={COLOR_SUGGESTIONS}
        values={values.colors}
        onAdd={(color) =>
          setValues((v) => {
            if (v.colors.includes(color)) return v;
            return {
              ...v,
              colors: [...v.colors, color],
              colorImages: { ...v.colorImages, [color]: v.colorImages[color] || [] },
              colorSizes: { ...v.colorSizes, [color]: v.colorSizes[color] || [] },
            };
          })
        }
        onRemove={(color) =>
          setValues((v) => ({
            ...v,
            colors: v.colors.filter((c) => c !== color),
            colorImages: Object.fromEntries(
              Object.entries(v.colorImages).filter(([key]) => key !== color),
            ),
            colorSizes: Object.fromEntries(
              Object.entries(v.colorSizes).filter(([key]) => key !== color),
            ),
          }))
        }
      />

      <ColorImagesEditor
        colors={values.colors}
        colorImages={values.colorImages}
        productId={product?.id}
        onChange={(colorImages) => setValues((v) => ({ ...v, colorImages }))}
      />

      <ColorSizesEditor
        colors={values.colors}
        colorSizes={values.colorSizes}
        onChange={(colorSizes) => setValues((v) => ({ ...v, colorSizes }))}
      />

      <MultiSuggestionField
        legend="Sizes"
        placeholder="Start typing size..."
        suggestions={SIZE_SUGGESTIONS}
        values={values.sizes}
        onAdd={(size) =>
          setValues((v) =>
            v.sizes.includes(size) ? v : { ...v, sizes: [...v.sizes, size] },
          )
        }
        onRemove={(size) =>
          setValues((v) => ({ ...v, sizes: v.sizes.filter((s) => s !== size) }))
        }
      />

      <MultiSuggestionField
        legend="Tags"
        placeholder="Start typing tag..."
        suggestions={TAG_SUGGESTIONS}
        values={values.tags}
        formatValue={formatTag}
        onAdd={(tag) =>
          setValues((v) => (v.tags.includes(tag) ? v : { ...v, tags: [...v.tags, tag] }))
        }
        onRemove={(tag) =>
          setValues((v) => ({ ...v, tags: v.tags.filter((t) => t !== tag) }))
        }
      />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isNew}
            onChange={(e) => setValues((v) => ({ ...v, isNew: e.target.checked }))}
          />
          New arrival
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isBestSeller}
            onChange={(e) => setValues((v) => ({ ...v, isBestSeller: e.target.checked }))}
          />
          Best seller
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.inStock}
            onChange={(e) => setValues((v) => ({ ...v, inStock: e.target.checked }))}
          />
          In stock
        </label>
      </div>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
        <button className="admin-btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save product"}
        </button>
        <Link href="/admin/products" className="admin-btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
