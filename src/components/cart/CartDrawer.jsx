"use client";

import ProductImage from "@/components/product/ProductImage";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { copyProductImagesForWhatsApp } from "@/lib/whatsapp-images";
import { getWhatsAppOrderUrl, buildWhatsAppOrderMessage } from "@/lib/whatsapp";
import { IconMinus, IconPlus, IconWhatsApp } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

function CartSection({ title, summary, defaultOpen = false, children }) {
  return (
    <details
      className="group rounded-xl border border-[var(--color-border)] bg-white"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
          {summary && (
            <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{summary}</p>
          )}
        </div>
        <ChevronDown className="size-4 shrink-0 text-[var(--color-muted)] transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-[var(--color-border)] px-4 py-3">
        {children}
      </div>
    </details>
  );
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    total,
    itemCount,
    appliedCoupon,
    setAppliedCoupon,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [couponDraft, setCouponDraft] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const couponInput = couponDraft || appliedCoupon?.code || "";

  const couponBelowMinimum =
    appliedCoupon?.minOrderAmount &&
    subtotal < Number(appliedCoupon.minOrderAmount);

  const contactSummary =
    name || phone || email
      ? [name, phone, email].filter(Boolean).join(" · ")
      : "Add name, phone & email for tracking";

  const whatsappItems = items.map((i) => ({
    name: i.name,
    slug: i.slug,
    sku: i.sku,
    price: i.price,
    quantity: i.quantity,
    size: i.size,
    image: i.image,
  }));

  const checkoutUrl =
    items.length > 0
      ? getWhatsAppOrderUrl(whatsappItems, {
          name,
          phone,
          note,
          couponCode: discount > 0 ? appliedCoupon?.code : undefined,
          discountAmount: discount > 0 ? discount : undefined,
        })
      : "#";

  async function applyCoupon(event) {
    event.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();

      if (!data.valid) {
        setCouponError(data.error || "Could not apply coupon.");
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(data.coupon);
      setCouponError("");
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponDraft("");
    setCouponError("");
  }

  function handleWhatsAppOrderClick() {
    if (!items.length) return;
    void copyProductImagesForWhatsApp(items.map((item) => item.image));

    const messagePreview = buildWhatsAppOrderMessage(whatsappItems, {
      name,
      phone,
      note,
      couponCode: discount > 0 ? appliedCoupon?.code : undefined,
      discountAmount: discount > 0 ? discount : undefined,
    });

    void fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        note,
        items: whatsappItems,
        couponCode: discount > 0 ? appliedCoupon?.code : "",
        discountAmount: discount > 0 ? discount : null,
        total,
        whatsappMessagePreview: messagePreview,
      }),
    });
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full max-h-dvh w-full flex-col gap-0 overflow-hidden border-[var(--color-border)] bg-[var(--color-cream)] p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-[var(--color-border)] bg-white px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)]">
                Your Bag
              </SheetTitle>
              {items.length > 0 && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
            {items.length > 0 && (
              <Link
                href="/shop"
                onClick={closeCart}
                className="shrink-0 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                + Add more
              </Link>
            )}
          </div>
          <SheetDescription className="sr-only">
            Review items and order on WhatsApp
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="mb-6 text-[var(--color-muted)]">Your bag is empty</p>
            <Button variant="brand" size="pill" render={<Link href="/shop" onClick={closeCart} />}>
              Explore Collection
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
              <ul className="space-y-3">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;

                  return (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="rounded-xl border border-[var(--color-border)] bg-white p-3"
                    >
                      <div className="flex gap-3">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="relative h-[4.5rem] w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface)]"
                        >
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="line-clamp-2 text-sm font-medium leading-snug hover:text-[var(--color-primary)]"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                                {item.sku} · {item.size}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                              {formatPrice(lineTotal)}
                            </p>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-cream)]/60">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-l-full"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.quantity - 1,
                                  )
                                }
                                aria-label="Decrease quantity"
                              >
                                <IconMinus />
                              </Button>
                              <span className="w-7 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-r-full"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.quantity + 1,
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                <IconPlus />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs text-[var(--color-muted)]"
                              onClick={() => removeItem(item.productId, item.size)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <CartSection
                title="Coupon code"
                summary={
                  appliedCoupon
                    ? `${appliedCoupon.code} applied${discount > 0 ? ` · −${formatPrice(discount)}` : ""}`
                    : "Tap to apply a discount"
                }
              >
                <form onSubmit={applyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="cart-coupon"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) =>
                        setCouponDraft(e.target.value.toUpperCase())
                      }
                      className="uppercase"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="shrink-0"
                      disabled={applyingCoupon}
                    >
                      {applyingCoupon ? "…" : "Apply"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600">{couponError}</p>
                  )}
                  {appliedCoupon && !couponError && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                      <span>
                        <span className="font-semibold">{appliedCoupon.code}</span>{" "}
                        applied
                      </span>
                      <button
                        type="button"
                        className="font-medium underline"
                        onClick={removeCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponBelowMinimum && (
                    <p className="text-xs text-amber-700">
                      Add more items to use {appliedCoupon?.code} (min{" "}
                      {formatPrice(Number(appliedCoupon?.minOrderAmount))}).
                    </p>
                  )}
                </form>
              </CartSection>

              <CartSection
                title="Your details"
                summary={contactSummary}
                defaultOpen={items.length <= 2}
              >
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="cart-name" className="sr-only">
                      Your name
                    </Label>
                    <Input
                      id="cart-name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cart-phone" className="sr-only">
                      Phone number
                    </Label>
                    <Input
                      id="cart-phone"
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cart-email" className="sr-only">
                      Email
                    </Label>
                    <Input
                      id="cart-email"
                      type="email"
                      placeholder="Email (for order tracking)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cart-note" className="sr-only">
                      Special requests
                    </Label>
                    <Textarea
                      id="cart-note"
                      placeholder="Special requests (size, color, delivery...)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CartSection>
            </div>

            <div className="shrink-0 border-t border-[var(--color-border)] bg-white px-4 py-4 shadow-[0_-10px_30px_rgba(42,18,18,0.08)]">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-[var(--color-muted)]">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-[family-name:var(--font-display)] text-xl text-[var(--color-primary)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                variant="whatsapp"
                size="pill"
                className="mt-4 w-full"
                render={
                  <a
                    href={checkoutUrl}
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppOrderClick}
                  />
                }
              >
                <IconWhatsApp className="size-5" />
                Order on WhatsApp
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full text-xs text-[var(--color-muted)]"
                onClick={clearCart}
              >
                Clear bag
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
