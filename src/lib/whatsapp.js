import { site } from "./site";
import { formatPrice } from "./format";
import { getWhatsAppImageReference } from "./product-images";

/** International digits only, with India country code when needed */
export function getWhatsAppPhone() {
  let digits = site.whatsapp.replace(/\D/g, "");
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Opens WhatsApp Web/App reliably (api.whatsapp.com works better than wa.me on mobile browsers).
 * @param {string} [text]
 */
export function getWhatsAppSendUrl(text = "") {
  const phone = getWhatsAppPhone();
  const params = new URLSearchParams({ phone });
  if (text) {
    params.set("text", text);
  }
  return `https://api.whatsapp.com/send?${params.toString()}`;
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );
}

/**
 * @param {string} url
 * @param {string} prefix
 */
function prependWhatsAppMessage(url, prefix) {
  if (!prefix) return url;

  try {
    const parsed = new URL(url);
    const current = parsed.searchParams.get("text") || "";
    parsed.searchParams.set("text", `${prefix}${current}`);
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Open WhatsApp immediately (must run in the same click/tap — no await before navigate).
 * @param {string} url
 * @param {{ copyImageSources?: Array<string | null | undefined> }} [options]
 */
export function openWhatsApp(url, options = {}) {
  if (typeof window === "undefined") return;

  const { copyImageSources = [] } = options;

  if (copyImageSources.length) {
    import("@/lib/whatsapp-images").then((mod) => {
      void mod.copyProductImagesForWhatsApp(copyImageSources);
    });
  }

  const finalUrl =
    copyImageSources.length > 0
      ? prependWhatsAppMessage(
          url,
          "📷 If product photo copied, paste it in chat before sending.\n\n",
        )
      : url;

  if (isMobileDevice()) {
    window.location.assign(finalUrl);
    return;
  }

  const opened = window.open(finalUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(finalUrl);
  }
}

/** @deprecated Use openWhatsApp — kept for existing imports */
export function openWhatsAppWithProductImages({ url, imageSources = [] }) {
  openWhatsApp(url, { copyImageSources: imageSources });
}

/**
 * @param {import('./products').Product[]} items
 * @param {{ name?: string; phone?: string; note?: string }} customer
 */
export function buildWhatsAppOrderMessage(items, customer = {}) {
  const lines = [
    `Hello ${site.name}!`,
    "",
    "I would like to place an order:",
    "",
  ];

  let total = 0;

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    lines.push(
      `${index + 1}. *${item.name}*`,
      `   Code: ${item.sku}`,
      `   Qty: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ""}`,
      `   Price: ${formatPrice(item.price)} each`,
      `   Subtotal: ${formatPrice(lineTotal)}`,
    );

    const productRef = getWhatsAppImageReference(item.image, { slug: item.slug });
    if (productRef) {
      lines.push(
        item.slug ? `   View product: ${productRef}` : `   Photo: ${productRef}`,
      );
    }

    lines.push("");
  });

  const discountAmount = Number(customer.discountAmount) || 0;
  const grandTotal = Math.max(0, total - discountAmount);

  if (discountAmount > 0 && customer.couponCode) {
    lines.push(`Subtotal: ${formatPrice(total)}`);
    lines.push(
      `Coupon *${customer.couponCode}*: -${formatPrice(discountAmount)}`,
    );
    lines.push(`*Estimated total: ${formatPrice(grandTotal)}*`);
  } else {
    lines.push(`*Estimated total: ${formatPrice(total)}*`);
  }

  lines.push("");
  lines.push("Please confirm availability and payment details.");

  if (customer.name) {
    lines.push("");
    lines.push(`Name: ${customer.name}`);
  }
  if (customer.phone) {
    lines.push(`Phone: ${customer.phone}`);
  }
  if (customer.couponCode) {
    lines.push("");
    lines.push(`Coupon code: ${customer.couponCode}`);
  }
  if (customer.note) {
    lines.push("");
    lines.push(`Note: ${customer.note}`);
  }

  return lines.join("\n");
}

/**
 * @param {import('./products').Product[]} items
 * @param {{ name?: string; phone?: string; note?: string }} customer
 */
export function getWhatsAppOrderUrl(items, customer = {}) {
  const message = buildWhatsAppOrderMessage(items, customer);
  return getWhatsAppSendUrl(message);
}

export function getWhatsAppInquiryUrl(productName, sku, imageSrc, slug) {
  const lines = [
    `Hi ${site.name}! I'm interested in *${productName}* (${sku}). Is it available? Please share more details.`,
  ];

  const productRef = getWhatsAppImageReference(imageSrc, { slug });
  if (productRef) {
    lines.push("");
    lines.push(slug ? `View product: ${productRef}` : `Photo: ${productRef}`);
  }

  return getWhatsAppSendUrl(lines.join("\n"));
}

export function getWhatsAppChatUrl() {
  return getWhatsAppSendUrl();
}
