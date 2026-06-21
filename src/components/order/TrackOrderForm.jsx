"use client";

import Image from "next/image";
import { useState } from "react";
import OrderTrackingTimeline from "@/components/order/OrderTrackingTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";

function OrderPreviewImage({ src, alt }) {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center bg-[var(--color-cream)] text-xs font-semibold text-[var(--color-muted)]">
        MM
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="80px"
      className="object-cover"
    />
  );
}

function OrderListCard({ order, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      className="flex w-full items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-left shadow-sm transition-colors hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-cream)]/20"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white sm:size-20">
        <OrderPreviewImage src={order.previewImage} alt={order.previewTitle} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--color-text)] sm:text-base">
          {order.previewTitle}
        </p>
        {order.previewSubtitle && (
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{order.previewSubtitle}</p>
        )}
        <p className="mt-1 font-mono text-[11px] text-[var(--color-primary)]">
          {order.trackingId}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="rounded-full bg-[var(--color-cream)] px-3 py-1 text-[10px] font-semibold text-[var(--color-primary)] sm:text-xs">
          {order.statusLabel}
        </span>
        <span className="text-[10px] text-[var(--color-muted)]">View details →</span>
      </div>
    </button>
  );
}

function OrderDetailPanel({ order, onBack, showBack }) {
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to all orders
        </button>
      )}

      <div className="mb-5 flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Tracking ID
          </p>
          <p className="font-mono text-lg font-bold text-[var(--color-primary)]">
            {order.trackingId}
          </p>
          {order.customerName && (
            <p className="mt-1 text-sm text-[var(--color-muted)]">{order.customerName}</p>
          )}
        </div>
        <span className="inline-flex w-fit rounded-full bg-[var(--color-cream)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {order.statusLabel}
        </span>
      </div>

      <OrderTrackingTimeline timeline={order.timeline} />

      {order.items?.length > 0 && (
        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="mb-3 text-sm font-semibold">Order items</p>
          <ul className="space-y-3">
            {order.items.map((item, index) => (
              <li
                key={`${item.sku || item.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)]">
                  <OrderPreviewImage
                    src={item.image}
                    alt={item.name || "Product"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {item.sku ? `Code: ${item.sku}` : ""}
                    {item.quantity ? `${item.sku ? " · " : ""}Qty: ${item.quantity}` : ""}
                    {item.size ? ` · Size: ${item.size}` : ""}
                  </p>
                  {item.price ? (
                    <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                      {formatPrice(item.price)}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {order.total != null && (
            <p className="mt-3 text-right text-sm font-semibold text-[var(--color-primary)]">
              Total: {formatPrice(order.total)}
            </p>
          )}
        </div>
      )}

      {order.note && (
        <p className="mt-4 rounded-lg bg-[var(--color-cream)]/40 px-3 py-2 text-xs text-[var(--color-muted)]">
          Note: {order.note}
        </p>
      )}
    </article>
  );
}

export default function TrackOrderForm() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    setSelectedOrderId(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not find orders");
      }

      const nextOrders = data.orders || [];
      setOrders(nextOrders);
      if (nextOrders.length === 1) {
        setSelectedOrderId(nextOrders[0].id);
      }
    } catch (trackError) {
      setError(trackError.message || "Could not track order");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6"
      >
      
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="track-phone">Mobile number</Label>
            <Input
              id="track-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="track-email">Email</Label>
            <Input
              id="track-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          variant="brand"
          size="pill"
          className="mt-5"
          disabled={loading}
        >
          {loading ? "Searching…" : "Track order"}
        </Button>
      </form>

      {searched && !loading && orders.length === 0 && !error && (
        <p className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-muted)]">
          No active orders found for this mobile number or email. Delivered orders are not
          shown here. Please check your details or contact us on WhatsApp.
        </p>
      )}

      {orders.length > 1 && !selectedOrder && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {orders.length} active orders — select one to view details
          </p>
          {orders.map((order) => (
            <OrderListCard
              key={order.id}
              order={order}
              onSelect={setSelectedOrderId}
            />
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          showBack={orders.length > 1}
          onBack={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
