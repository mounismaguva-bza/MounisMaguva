"use client";

import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminTableActions,
  OrderItemImage,
  OrderStatusBadge,
  formatOrderDate,
} from "@/components/admin/OrderManageUI";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_CONFIG,
  getOrderPreview,
  normalizeOrderStatus,
} from "@/lib/order-tracking";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [parsedMeta, setParsedMeta] = useState({
    couponCode: "",
    discountAmount: null,
    total: null,
    note: "",
  });
  const [parseWarnings, setParseWarnings] = useState([]);
  const [parseError, setParseError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function resetCreateForm() {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setWhatsappMessage("");
    setParsedItems([]);
    setParsedMeta({ couponCode: "", discountAmount: null, total: null, note: "" });
    setParseWarnings([]);
    setParseError("");
  }

  function openCreateForm() {
    resetCreateForm();
    setShowCreateForm(true);
  }

  function closeCreateForm() {
    resetCreateForm();
    setShowCreateForm(false);
  }

  async function loadOrders() {
    setLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const data = await response.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function parseWhatsAppMessage(event) {
    event?.preventDefault?.();
    setParsing(true);
    setParseError("");
    setParseWarnings([]);

    try {
      const response = await fetch("/api/admin/orders/parse-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: whatsappMessage }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not parse WhatsApp message");
      }

      setParsedItems(data.items || []);
      setParsedMeta({
        couponCode: data.couponCode || "",
        discountAmount: data.discountAmount ?? null,
        total: data.total ?? null,
        note: data.note || "",
      });
      setParseWarnings(data.warnings || []);
    } catch (parseErr) {
      setParsedItems([]);
      setParsedMeta({ couponCode: "", discountAmount: null, total: null, note: "" });
      setParseError(parseErr.message || "Could not parse message");
    } finally {
      setParsing(false);
    }
  }

  async function createOrder(event) {
    event.preventDefault();

    if (!parsedItems.length) {
      setParseError("Parse the WhatsApp message first to load products.");
      return;
    }

    setCreating(true);
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerPhone,
        customerEmail,
        status: "placed",
        items: parsedItems,
        couponCode: parsedMeta.couponCode,
        discountAmount: parsedMeta.discountAmount,
        total: parsedMeta.total,
        note: parsedMeta.note,
        whatsappMessagePreview: whatsappMessage,
      }),
    });

    setCreating(false);
    closeCreateForm();
    loadOrders();
  }

  async function quickUpdateStatus(order, status) {
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, status }),
    });
    loadOrders();
  }

  async function confirmDeleteOrder() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/orders/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    loadOrders();
  }

  const filteredOrders = orders.filter((order) => {
    const status = normalizeOrderStatus(order.status);
    if (statusFilter !== "all" && status !== statusFilter) return false;

    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      order.customerName?.toLowerCase().includes(q) ||
      order.customerPhone?.toLowerCase().includes(q) ||
      order.customerEmail?.toLowerCase().includes(q) ||
      order.trackingId?.toLowerCase().includes(q) ||
      order.items?.some(
        (item) =>
          item.name?.toLowerCase().includes(q) || item.sku?.toLowerCase().includes(q),
      )
    );
  });

  const statusFilters = [
    { id: "all", label: "All" },
    ...["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"].map(
      (status) => ({
        id: status,
        label: ORDER_STATUS_CONFIG[status]?.label || status,
      }),
    ),
  ];

  return (
    <section className="space-y-4">
      <AdminPageHeader
        title="Orders"
        subtitle={
          loading
            ? "Loading orders…"
            : `${orders.length} total · ${filteredOrders.length} shown`
        }
        actions={
          <button className="admin-btn-primary" type="button" onClick={openCreateForm}>
            Create order
          </button>
        }
      />

      <Dialog
        open={showCreateForm}
        onOpenChange={(open) => {
          if (!open) closeCreateForm();
          else setShowCreateForm(true);
        }}
      >
        <DialogContent className="max-w-3xl">
          <form onSubmit={createOrder} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader>
              <DialogTitle>Create Manual Order</DialogTitle>
              <DialogDescription>
                Paste the WhatsApp message from the customer — products are detected automatically.
                Enter customer name, phone, and email manually.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <textarea
                className="input-field min-h-36 font-mono text-xs"
                placeholder="Paste customer WhatsApp order message here…"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  className="admin-btn-secondary text-sm"
                  type="button"
                  onClick={parseWhatsAppMessage}
                  disabled={parsing || !whatsappMessage.trim()}
                >
                  {parsing ? "Parsing…" : "Parse products from message"}
                </button>
              </div>

              {parseError && <p className="text-sm text-red-600">{parseError}</p>}

              {parseWarnings.length > 0 && (
                <ul className="space-y-1 text-xs text-amber-700">
                  {parseWarnings.map((warning) => (
                    <li key={warning}>⚠ {warning}</li>
                  ))}
                </ul>
              )}

              {parsedItems.length > 0 && (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)]/30 p-3">
                  <p className="text-sm font-medium">
                    Parsed products ({parsedItems.length})
                  </p>
                  <ul className="mt-2 space-y-2">
                    {parsedItems.map((item, index) => (
                      <li
                        key={`${item.sku}-${index}`}
                        className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {item.sku}
                          {item.size ? ` · Size: ${item.size}` : ""}
                          {" · "}
                          Qty: {item.quantity}
                          {" · "}
                          {formatPrice(item.price)} each
                        </p>
                      </li>
                    ))}
                  </ul>
                  {(parsedMeta.couponCode || parsedMeta.total) && (
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      {parsedMeta.couponCode && `Coupon: ${parsedMeta.couponCode}`}
                      {parsedMeta.discountAmount
                        ? ` · Discount: ${formatPrice(parsedMeta.discountAmount)}`
                        : ""}
                      {parsedMeta.total != null ? ` · Total: ${formatPrice(parsedMeta.total)}` : ""}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="input-field"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Customer phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="email"
                  placeholder="Customer email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <button className="admin-btn-secondary text-sm" type="button" onClick={closeCreateForm}>
                Cancel
              </button>
              <button
                className="admin-btn-primary text-sm"
                type="submit"
                disabled={creating || !parsedItems.length}
              >
                {creating ? "Saving…" : "Save order"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="input-field max-w-md"
          placeholder="Search customer, phone, email, tracking ID, product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                statusFilter === filter.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-white text-[var(--color-muted)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        {loading ? (
          <p className="p-6 text-sm text-[var(--color-muted)]">Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-muted)]">
            {orders.length ? "No orders match your search." : "No orders yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-cream)]/50 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = normalizeOrderStatus(order.status);
                  const preview = getOrderPreview(order.items);

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--color-border)]/60 last:border-0 hover:bg-[var(--color-cream)]/25"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]">
                            <OrderItemImage
                              src={preview.previewImage}
                              alt={preview.previewTitle}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{preview.previewTitle}</p>
                            <p className="mt-0.5 font-mono text-[11px] text-[var(--color-primary)]">
                              {order.trackingId || order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-[var(--color-muted)]">
                              {preview.itemCount} item{preview.itemCount === 1 ? "" : "s"}
                              {order.total != null ? ` · ${formatPrice(order.total)}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customerName || "—"}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                          {order.customerPhone || "—"}
                        </p>
                        {order.customerEmail ? (
                          <p className="text-xs text-[var(--color-muted)]">{order.customerEmail}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={status} />
                        <div className="mt-2 flex flex-wrap gap-1">
                          {["placed", "confirmed", "packed", "shipped", "delivered"].map((step) => (
                            <button
                              key={step}
                              type="button"
                              title={ORDER_STATUS_CONFIG[step]?.label}
                              onClick={() => quickUpdateStatus(order, step)}
                              className={`size-2 rounded-full ${
                                status === step
                                  ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                  : "bg-[var(--color-border)] hover:bg-[var(--color-primary)]/40"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                        {formatOrderDate(order.updatedAt || order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <AdminTableActions
                          manageHref={`/admin/orders/${order.id}`}
                          onDelete={() => setDeleteTarget(order)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              Permanently delete the order for{" "}
              <strong>{deleteTarget?.customerName || "this customer"}</strong>
              {deleteTarget?.trackingId ? ` (${deleteTarget.trackingId})` : ""}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="rounded px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600"
              onClick={() => setDeleteTarget(null)}
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
