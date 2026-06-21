/** @typedef {"placed" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled"} OrderStatus */

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

/** Steps shown on customer tracking timeline (excludes cancelled) */
export const TRACKING_FLOW = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

export const ORDER_STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    description: "We received your order successfully",
  },
  confirmed: {
    label: "Order Confirmed",
    description: "Your order is confirmed and being processed",
  },
  packed: {
    label: "Packed",
    description: "Your items are packed and ready to ship",
  },
  shipped: {
    label: "Courier Started",
    description: "Your order is with the courier / in transit",
  },
  delivered: {
    label: "Delivered",
    description: "Order delivered successfully",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled",
  },
};

export const ORDER_STATUS_STYLES = {
  placed: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  packed: "bg-amber-100 text-amber-900 border-amber-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

/** @param {string} [status] */
export function getOrderStatusStyle(status) {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_STYLES[normalized] || ORDER_STATUS_STYLES.placed;
}

/** @param {string} [status] */
export function normalizeOrderStatus(status) {
  const value = String(status || "placed").toLowerCase();
  if (value === "new") return "placed";
  return ORDER_STATUSES.includes(value) ? value : "placed";
}

/** @param {string} [phone] */
export function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

/** @param {string} [email] */
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function generateTrackingId() {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `MG-${suffix}`;
}

/** @param {string} status */
export function getStatusIndex(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "cancelled") return -1;
  return TRACKING_FLOW.indexOf(normalized);
}

/** @param {string} status @param {string} [updatedAt] @param {Array<{ status: string; at: string }>} [statusHistory] */
export function buildTrackingTimeline(status, updatedAt, statusHistory) {
  const current = normalizeOrderStatus(status);
  const currentIndex = getStatusIndex(current);

  const historyMap = {};
  if (Array.isArray(statusHistory)) {
    statusHistory.forEach((entry) => {
      const step = normalizeOrderStatus(entry.status);
      if (!historyMap[step]) historyMap[step] = entry.at;
    });
  }

  if (current === "cancelled") {
    return TRACKING_FLOW.map((step) => ({
      status: step,
      ...ORDER_STATUS_CONFIG[step],
      state: "cancelled",
    }));
  }

  return TRACKING_FLOW.map((step, index) => {
    let state = "upcoming";
    if (index < currentIndex) state = "complete";
    if (index === currentIndex) state = "current";
    return {
      status: step,
      ...ORDER_STATUS_CONFIG[step],
      state,
      at: historyMap[step] || (index === currentIndex ? updatedAt : undefined),
    };
  });
}

/** @param {string} [status] */
export function isActiveTrackableOrder(status) {
  const normalized = normalizeOrderStatus(status);
  return normalized !== "delivered" && normalized !== "cancelled";
}

/** @param {Array<Record<string, unknown>>} [items] */
export function getOrderPreview(items) {
  const list = Array.isArray(items) ? items : [];
  const first = list[0] || {};
  const firstName = String(first.name || "").trim();
  const extraCount = Math.max(0, list.length - 1);

  return {
    previewImage: String(first.image || "").trim(),
    previewTitle: firstName || "Order",
    previewSubtitle:
      extraCount > 0
        ? `+ ${extraCount} more item${extraCount > 1 ? "s" : ""}`
        : "",
    itemCount: list.length,
  };
}

/** @param {Record<string, unknown>} order */
export function toPublicOrder(order) {
  const status = normalizeOrderStatus(String(order.status || "placed"));
  const items = Array.isArray(order.items) ? order.items : [];
  const preview = getOrderPreview(items);

  return {
    id: String(order.id || ""),
    trackingId: String(order.trackingId || order.id || ""),
    customerName: String(order.customerName || ""),
    status,
    statusLabel: ORDER_STATUS_CONFIG[status]?.label || status,
    statusDescription: ORDER_STATUS_CONFIG[status]?.description || "",
    updatedAt: order.updatedAt || order.createdAt || null,
    createdAt: order.createdAt || null,
    timeline: buildTrackingTimeline(
      status,
      order.updatedAt || order.createdAt,
      order.statusHistory,
    ),
    items,
    note: String(order.note || ""),
    total: order.total != null ? Number(order.total) : null,
    ...preview,
  };
}

/** @param {Array<Record<string, unknown>>} orders @param {{ phone?: string; email?: string }} contact */
export function filterOrdersByContact(orders, contact) {
  const phone = normalizePhone(contact.phone);
  const email = normalizeEmail(contact.email);

  if (!phone && !email) return [];

  return orders.filter((order) => {
    const orderPhone = normalizePhone(String(order.customerPhone || ""));
    const orderEmail = normalizeEmail(String(order.customerEmail || ""));

    if (phone && orderPhone && orderPhone === phone) return true;
    if (email && orderEmail && orderEmail === email) return true;
    return false;
  });
}
