import { site } from "./site";

export function formatPrice(amount) {
  return new Intl.NumberFormat(site.locale, {
    style: "currency",
    currency: site.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDiscount(original, sale) {
  if (!original || original <= sale) return null;
  return Math.round(((original - sale) / original) * 100);
}
