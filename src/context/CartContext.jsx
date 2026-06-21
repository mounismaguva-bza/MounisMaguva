"use client";

import {
  calculateCouponDiscount,
} from "@/lib/coupon-math";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "maguva-cart";
const COUPON_KEY = "maguva-cart-coupon";

/** @typedef {{ productId: string; slug: string; sku: string; name: string; price: number; image: string; quantity: number; size: string; color?: string; imageIndex?: number }} CartItem */

/** @typedef {{
 *   code: string;
 *   label?: string;
 *   discountType: string;
 *   discountValue: number;
 *   minOrderAmount?: number | null;
 * }} AppliedCoupon */

/** @type {React.Context<{
 *   items: CartItem[];
 *   isOpen: boolean;
 *   itemCount: number;
 *   subtotal: number;
 *   discount: number;
 *   total: number;
 *   appliedCoupon: AppliedCoupon | null;
 *   openCart: () => void;
 *   closeCart: () => void;
 *   toggleCart: () => void;
 *   addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
 *   removeItem: (productId: string, size: string) => void;
 *   updateQuantity: (productId: string, size: string, quantity: number) => void;
 *   setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
 *   clearCart: () => void;
 * } | null>} */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(/** @type {CartItem[]} */ ([]));
  const [appliedCoupon, setAppliedCouponState] = useState(
    /** @type {AppliedCoupon | null} */ (null),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedCoupon = localStorage.getItem(COUPON_KEY);
      startTransition(() => {
        if (stored) setItems(JSON.parse(stored));
        if (storedCoupon) setAppliedCouponState(JSON.parse(storedCoupon));
      });
    } catch {
      /* ignore */
    }
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedCoupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  }, [appliedCoupon, hydrated]);

  const setAppliedCoupon = useCallback((coupon) => {
    setAppliedCouponState(coupon);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addItem = useCallback(
    /** @param {Omit<CartItem, 'quantity'> & { quantity?: number }} */ (item) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === item.productId && i.size === item.size,
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.size === item.size
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i,
          );
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((productId, size) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size)),
    );
  }, []);

  const updateQuantity = useCallback((productId, size, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCouponState(null);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    const minOrder = appliedCoupon.minOrderAmount
      ? Number(appliedCoupon.minOrderAmount)
      : 0;
    if (minOrder > 0 && subtotal < minOrder) return 0;
    return calculateCouponDiscount(subtotal, appliedCoupon);
  }, [appliedCoupon, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      itemCount,
      subtotal,
      discount,
      total,
      appliedCoupon,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      setAppliedCoupon,
      clearCart,
    }),
    [
      items,
      isOpen,
      itemCount,
      subtotal,
      discount,
      total,
      appliedCoupon,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      setAppliedCoupon,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
