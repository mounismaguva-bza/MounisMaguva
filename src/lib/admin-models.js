import { slugify } from "@/lib/utils";
import { getAllProductImages, normalizeColorImagesPayload } from "@/lib/product-images";
import {
  normalizeOrderStatus,
  ORDER_STATUSES,
  generateTrackingId,
} from "@/lib/order-tracking";

export { ORDER_STATUSES };
export const BANNER_PLACEMENTS = ["home", "collections"];
export const COUPON_DISCOUNT_TYPES = ["percent", "fixed"];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

const COLOR_HEX_PALETTE = [
  "#801818",
  "#722F37",
  "#C9A227",
  "#1e3a5f",
  "#98D8C8",
  "#F4C2C2",
  "#FFCBA4",
  "#2d6a4f",
];

function buildColorOptions(labels, inStock = true) {
  return labels.map((label, index) => {
    const text = String(label).trim();
    const abbr = text
      .split(/[\s/&]+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return {
      id: slugify(text) || `color-${index}`,
      label: text,
      abbr: abbr || "CLR",
      hex: COLOR_HEX_PALETTE[index % COLOR_HEX_PALETTE.length],
      available: inStock !== false,
    };
  });
}

function normalizeColorSizesPayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const map = {};
  Object.entries(raw).forEach(([color, sizes]) => {
    const list = Array.isArray(sizes)
      ? sizes.map((s) => String(s).trim()).filter(Boolean)
      : [];
    if (list.length) map[color] = list;
  });
  return map;
}

export function normalizeProductInput(payload = {}) {
  const name = String(payload.name || "").trim();
  const colors = toStringArray(payload.colors);
  const inStock = payload.inStock !== false;
  const colorOptions =
    Array.isArray(payload.colorOptions) && payload.colorOptions.length
      ? payload.colorOptions
      : buildColorOptions(colors, inStock);

  const colorImages = normalizeColorImagesPayload(payload.colorImages, colors);
  const productForImages = { colorImages, colors, images: toStringArray(payload.images) };
  const images = getAllProductImages(productForImages);
  const colorSizes = normalizeColorSizesPayload(payload.colorSizes);

  return {
    slug: slugify(payload.slug || name),
    sku: String(payload.sku || "").trim(),
    name,
    description: String(payload.description || "").trim(),
    price: toNumber(payload.price),
    originalPrice: payload.originalPrice ? toNumber(payload.originalPrice) : null,
    category: String(payload.category || "sarees").trim(),
    colorImages,
    colorSizes,
    images,
    fabric: String(payload.fabric || "").trim(),
    colors,
    color: colors[0] || String(payload.color || "").trim(),
    sizes: toStringArray(payload.sizes),
    isNew: Boolean(payload.isNew),
    isBestSeller: Boolean(payload.isBestSeller),
    inStock,
    tags: toStringArray(payload.tags),
    blouse: String(payload.blouse || "").trim(),
    colorOptions,
  };
}

export function normalizeOrderInput(payload = {}) {
  const status = normalizeOrderStatus(payload.status);
  const existingHistory = Array.isArray(payload.statusHistory)
    ? payload.statusHistory
    : [];

  return {
    customerName: String(payload.customerName || "").trim(),
    customerPhone: String(payload.customerPhone || "").trim(),
    customerEmail: String(payload.customerEmail || "").trim(),
    note: String(payload.note || "").trim(),
    status,
    trackingId: String(payload.trackingId || "").trim() || generateTrackingId(),
    items: Array.isArray(payload.items) ? payload.items : [],
    whatsappMessagePreview: String(payload.whatsappMessagePreview || "").trim(),
    statusHistory: existingHistory,
    couponCode: String(payload.couponCode || "").trim(),
    discountAmount: payload.discountAmount ? Number(payload.discountAmount) : null,
    total: payload.total ? Number(payload.total) : null,
  };
}

export function appendStatusHistory(order, nextStatus) {
  const status = normalizeOrderStatus(nextStatus);
  const history = Array.isArray(order?.statusHistory) ? [...order.statusHistory] : [];
  const last = history[history.length - 1];

  if (!last || last.status !== status) {
    history.push({
      status,
      at: new Date().toISOString(),
    });
  }

  return history;
}

export function normalizeBannerInput(payload = {}) {
  const placement = String(payload.placement || "home");
  return {
    title: String(payload.title || "").trim(),
    subtitle: String(payload.subtitle || "").trim(),
    imageUrl: String(payload.imageUrl || "").trim(),
    href: String(payload.href || "").trim(),
    isActive: Boolean(payload.isActive),
    placement: BANNER_PLACEMENTS.includes(placement) ? placement : "home",
    sortOrder: toNumber(payload.sortOrder),
  };
}

export function normalizeMediaInput(payload = {}) {
  return {
    url: String(payload.url || "").trim(),
    storagePath: String(payload.storagePath || "").trim(),
    usageTags: toStringArray(payload.usageTags),
    altText: String(payload.altText || "").trim(),
  };
}

export function normalizeMediaOverrideInput(payload = {}) {
  return {
    alias: String(payload.alias || "").trim(),
    url: String(payload.url || "").trim(),
  };
}

export function normalizeCouponCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

export function normalizeCouponInput(payload = {}) {
  const discountType = String(payload.discountType || "percent").toLowerCase();
  const expiresAt = String(payload.expiresAt || "").trim();

  return {
    code: normalizeCouponCode(payload.code),
    label: String(payload.label || "").trim(),
    discountType: COUPON_DISCOUNT_TYPES.includes(discountType)
      ? discountType
      : "percent",
    discountValue: toNumber(payload.discountValue),
    minOrderAmount: payload.minOrderAmount ? toNumber(payload.minOrderAmount) : null,
    maxUses: payload.maxUses ? toNumber(payload.maxUses) : null,
    usedCount: toNumber(payload.usedCount, 0),
    expiresAt: expiresAt || null,
    active: payload.active !== false,
  };
}

export function normalizeHeroSlideInput(payload = {}) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    ctaLabel: String(payload.ctaLabel || "Shop collection").trim(),
    ctaHref: String(payload.ctaHref || "/shop").trim(),
    image: String(payload.image || "").trim(),
    alt: String(payload.alt || "").trim(),
    sortOrder: toNumber(payload.sortOrder),
    active: payload.active !== false,
  };
}
