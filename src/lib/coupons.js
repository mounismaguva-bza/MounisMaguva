import "server-only";

import { normalizeCouponCode } from "@/lib/admin-models";
import {
  calculateCouponDiscount,
  isCouponCurrentlyValid,
} from "@/lib/coupon-math";
import { formatPrice } from "@/lib/format";
import { COLLECTIONS, getDocument, listCollection } from "@/lib/firestore";

/** @param {Record<string, unknown>} doc */
export function formatCouponDiscount(doc) {
  if (!doc) return "";
  const value = Number(doc.discountValue) || 0;
  if (doc.discountType === "fixed") {
    return `₹${value} off`;
  }
  return `${value}% off`;
}

/** @returns {Promise<Array<Record<string, unknown>>>} */
export async function getAllCoupons() {
  try {
    return await listCollection(COLLECTIONS.coupons, {
      orderBy: "updatedAt",
      direction: "desc",
    });
  } catch {
    return [];
  }
}

/** @returns {Promise<Array<Record<string, unknown>>>} */
export async function getActiveCoupons() {
  const coupons = await getAllCoupons();
  return coupons.filter(isCouponCurrentlyValid);
}

/**
 * @param {string} code
 * @param {number} subtotal
 */
export async function validateCouponCode(code, subtotal) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return { valid: false, error: "Enter a coupon code." };
  }

  const coupon = await getDocument(COLLECTIONS.coupons, normalized);
  if (!coupon) {
    return { valid: false, error: "Invalid coupon code." };
  }

  if (!isCouponCurrentlyValid(coupon)) {
    return { valid: false, error: "This coupon is not active." };
  }

  const orderTotal = Number(subtotal) || 0;
  const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;

  if (minOrder > 0 && orderTotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order ${formatPrice(minOrder)} required for this coupon.`,
    };
  }

  const discountAmount = calculateCouponDiscount(orderTotal, coupon);

  return {
    valid: true,
    coupon: {
      code: String(coupon.code),
      label: String(coupon.label || ""),
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue) || 0,
      minOrderAmount: minOrder || null,
      discountAmount,
    },
    subtotal: orderTotal,
    total: Math.max(0, orderTotal - discountAmount),
  };
}
