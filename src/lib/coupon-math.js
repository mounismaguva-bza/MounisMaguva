/** @param {number} subtotal @param {{ discountType?: string; discountValue?: number }} coupon */
export function calculateCouponDiscount(subtotal, coupon) {
  const amount = Number(subtotal) || 0;
  if (!coupon || amount <= 0) return 0;

  const value = Number(coupon.discountValue) || 0;
  if (value <= 0) return 0;

  let discount =
    coupon.discountType === "fixed"
      ? value
      : Math.round((amount * value) / 100);

  return Math.min(Math.max(0, discount), amount);
}

/** @param {Record<string, unknown> | null | undefined} coupon */
export function isCouponCurrentlyValid(coupon) {
  if (!coupon || coupon.active === false || !coupon.code) return false;

  if (coupon.expiresAt) {
    const expires = new Date(String(coupon.expiresAt));
    if (Number.isFinite(expires.getTime())) {
      expires.setHours(23, 59, 59, 999);
      if (expires < new Date()) return false;
    }
  }

  if (coupon.maxUses && Number(coupon.usedCount) >= Number(coupon.maxUses)) {
    return false;
  }

  return true;
}
