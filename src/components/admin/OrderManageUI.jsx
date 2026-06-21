"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_CONFIG,
  getOrderPreview,
  getOrderStatusStyle,
  normalizeOrderStatus,
} from "@/lib/order-tracking";

export function OrderStatusBadge({ status, className = "" }) {
  const normalized = normalizeOrderStatus(status);
  const label = ORDER_STATUS_CONFIG[normalized]?.label || normalized;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusStyle(normalized)} ${className}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  );
}

export function ProductStockBadge({ inStock = true, className = "" }) {
  const available = inStock !== false;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
        available
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      } ${className}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${available ? "bg-emerald-500" : "bg-red-500"}`}
        aria-hidden
      />
      {available ? "In stock" : "Out of stock"}
    </span>
  );
}

export function OrderItemImage({ src, alt }) {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center bg-[var(--color-cream)] text-[10px] font-semibold text-[var(--color-muted)]">
        MM
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill sizes="64px" className="object-cover" />
  );
}

export function OrderItemsList({ items = [], showPrices = true }) {
  if (!items.length) {
    return (
      <p className="text-sm text-[var(--color-muted)]">No items in this order.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item.sku || item.name}-${index}`}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3"
        >
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <OrderItemImage src={item.image} alt={item.name || "Product"} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{item.name}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {item.sku ? `SKU: ${item.sku}` : ""}
              {item.quantity ? `${item.sku ? " · " : ""}Qty ${item.quantity}` : ""}
              {item.size ? ` · ${item.size}` : ""}
            </p>
          </div>
          {showPrices && item.price ? (
            <p className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
              {formatPrice(item.price * (item.quantity || 1))}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function OrderSummaryMeta({ order }) {
  const preview = getOrderPreview(order.items);

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]">
        <OrderItemImage src={preview.previewImage} alt={preview.previewTitle} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{preview.previewTitle}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {preview.itemCount} item{preview.itemCount === 1 ? "" : "s"}
          {order.total != null ? ` · ${formatPrice(order.total)}` : ""}
        </p>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, backHref, backLabel = "Back", actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← {backLabel}
          </Link>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminTableActions({
  manageHref,
  onDelete,
  manageLabel = "Manage",
  deleteLabel = "Delete",
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={manageHref}
        className="admin-btn-sm inline-flex items-center gap-1.5 whitespace-nowrap"
      >
        <Pencil className="size-3.5 shrink-0" aria-hidden />
        {manageLabel}
      </Link>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="admin-btn-sm-danger inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <Trash2 className="size-3.5 shrink-0" aria-hidden />
          {deleteLabel}
        </button>
      ) : null}
    </div>
  );
}

export function formatOrderDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
