"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AdminPageHeader,
  OrderItemsList,
  OrderStatusBadge,
  formatOrderDate,
} from "@/components/admin/OrderManageUI";
import OrderTrackingTimeline from "@/components/order/OrderTrackingTimeline";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_CONFIG,
  TRACKING_FLOW,
  buildTrackingTimeline,
  normalizeOrderStatus,
} from "@/lib/order-tracking";
import { buildWhatsAppOrderMessage } from "@/lib/whatsapp";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    async function loadOrder() {
      const response = await fetch(`/api/admin/orders/${orderId}`, { cache: "no-store" });
      const data = await response.json();
      setOrder(data.order || null);
    }
    if (orderId) loadOrder();
  }, [orderId]);

  const parsedItems = useMemo(
    () => (Array.isArray(order?.items) ? order.items : []),
    [order],
  );

  const whatsappMessage = useMemo(() => {
    if (!order) return "";
    return buildWhatsAppOrderMessage(parsedItems, {
      name: order.customerName,
      phone: order.customerPhone,
      note: order.note,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount,
    });
  }, [order, parsedItems]);

  const timeline = useMemo(() => {
    if (!order) return [];
    return buildTrackingTimeline(
      order.status,
      order.updatedAt,
      order.statusHistory,
    );
  }, [order]);

  const subtotal = useMemo(
    () =>
      parsedItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [parsedItems],
  );

  function updateStatus(nextStatus) {
    setOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    setSavedMessage("");
  }

  async function saveOrder(event) {
    event.preventDefault();
    if (!order) return;
    setSaving(true);
    setSavedMessage("");

    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        items: parsedItems,
        whatsappMessagePreview: whatsappMessage,
      }),
    });

    setSaving(false);
    setSavedMessage("Order saved successfully.");
  }

  async function confirmDeleteOrder() {
    setDeleting(true);
    await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    setDeleting(false);
    setShowDeleteDialog(false);
    router.push("/admin/orders");
    router.refresh();
  }

  if (!order) {
    return <p className="text-sm text-[var(--color-muted)]">Loading order…</p>;
  }

  const currentStatus = normalizeOrderStatus(order.status);

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title={order.customerName || "Manage order"}
        subtitle={
          order.trackingId
            ? `Tracking ID: ${order.trackingId} · Updated ${formatOrderDate(order.updatedAt)}`
            : `Updated ${formatOrderDate(order.updatedAt)}`
        }
        backHref="/admin/orders"
        backLabel="All orders"
        actions={
          <>
            <OrderStatusBadge status={currentStatus} />
            <button
              type="button"
              className="admin-btn-sm-danger"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm font-semibold">Order status</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Tap a step to update where this order is in the pipeline.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TRACKING_FLOW.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(status)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    currentStatus === status
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  {ORDER_STATUS_CONFIG[status]?.label || status}
                </button>
              ))}
              <button
                type="button"
                onClick={() => updateStatus("cancelled")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  currentStatus === "cancelled"
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-red-200 text-red-700 hover:bg-red-50"
                }`}
              >
                Cancelled
              </button>
            </div>
            <div className="mt-6 border-t border-[var(--color-border)] pt-5">
              <OrderTrackingTimeline timeline={timeline} />
            </div>
          </div>

          <form
            onSubmit={saveOrder}
            className="rounded-xl border border-[var(--color-border)] bg-white p-5"
          >
            <p className="text-sm font-semibold">Customer details</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Name
                </label>
                <input
                  className="input-field"
                  value={order.customerName || ""}
                  onChange={(e) => {
                    setOrder((prev) => ({ ...prev, customerName: e.target.value }));
                    setSavedMessage("");
                  }}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Phone
                </label>
                <input
                  className="input-field"
                  value={order.customerPhone || ""}
                  onChange={(e) => {
                    setOrder((prev) => ({ ...prev, customerPhone: e.target.value }));
                    setSavedMessage("");
                  }}
                  placeholder="Customer phone"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  value={order.customerEmail || ""}
                  onChange={(e) => {
                    setOrder((prev) => ({ ...prev, customerEmail: e.target.value }));
                    setSavedMessage("");
                  }}
                  placeholder="Customer email"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
                  Internal note
                </label>
                <textarea
                  className="input-field min-h-24"
                  value={order.note || ""}
                  onChange={(e) => {
                    setOrder((prev) => ({ ...prev, note: e.target.value }));
                    setSavedMessage("");
                  }}
                  placeholder="Notes for your team"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
              <button className="admin-btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              {savedMessage ? (
                <span className="text-sm text-emerald-700">{savedMessage}</span>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Order items</p>
              <span className="text-xs text-[var(--color-muted)]">
                {parsedItems.length} item{parsedItems.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-4">
              <OrderItemsList items={parsedItems} />
            </div>
            <div className="mt-4 space-y-1 border-t border-[var(--color-border)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--color-muted)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold text-[var(--color-primary)]">
                <span>Total</span>
                <span>{formatPrice(order.total ?? subtotal - (order.discountAmount || 0))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm font-semibold">WhatsApp</p>
            <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[var(--color-cream)]/40 p-3 text-xs text-[var(--color-muted)]">
              {whatsappMessage}
            </pre>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              This will permanently delete the order for{" "}
              <strong>{order.customerName || "this customer"}</strong>
              {order.trackingId ? ` (${order.trackingId})` : ""}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {order.items?.[0]?.image ? (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3">
                <div className="relative size-12 overflow-hidden rounded-lg">
                  <Image
                    src={order.items[0].image}
                    alt={order.items[0].name || "Product"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{order.items[0].name}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
              onClick={confirmDeleteOrder}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
