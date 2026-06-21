"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  code: "",
  label: "",
  discountType: "percent",
  discountValue: 10,
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  active: true,
};

function formatDiscount(coupon) {
  const value = Number(coupon.discountValue) || 0;
  if (coupon.discountType === "fixed") return `₹${value} off`;
  return `${value}% off`;
}

function statusLabel(coupon) {
  if (coupon.active === false) return "Inactive";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "Expired";
  if (coupon.maxUses && Number(coupon.usedCount) >= Number(coupon.maxUses)) {
    return "Limit reached";
  }
  return "Active";
}

export default function CouponsEditor() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    const res = await fetch("/api/admin/coupons", { cache: "no-store" });
    const data = await res.json();
    setCoupons(data.coupons || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoupons();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createCoupon(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minOrderAmount: form.minOrderAmount || null,
          maxUses: form.maxUses || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not create coupon");
      }

      setForm(emptyForm);
      await loadCoupons();
    } catch (saveError) {
      setError(saveError.message || "Could not create coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: coupon.active === false }),
    });
    loadCoupons();
  }

  async function deleteCoupon(coupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    loadCoupons();
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Coupon Codes
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Create discount codes, set active or inactive, or delete when no longer needed.
        </p>
      </div>

      <form
        onSubmit={createCoupon}
        className="rounded-xl border border-[var(--color-border)] bg-white p-4"
      >
        <p className="text-sm font-medium">Create coupon</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="input-field uppercase"
            placeholder="Coupon code (e.g. MAGUVA10)"
            value={form.code}
            onChange={(e) =>
              setForm((v) => ({ ...v, code: e.target.value.toUpperCase() }))
            }
            required
          />
          <input
            className="input-field"
            placeholder="Label (optional, e.g. Festive sale)"
            value={form.label}
            onChange={(e) => setForm((v) => ({ ...v, label: e.target.value }))}
          />
          <select
            className="input-field"
            value={form.discountType}
            onChange={(e) => setForm((v) => ({ ...v, discountType: e.target.value }))}
          >
            <option value="percent">Percent off (%)</option>
            <option value="fixed">Fixed amount off (₹)</option>
          </select>
          <input
            className="input-field"
            type="number"
            min={1}
            max={form.discountType === "percent" ? 100 : undefined}
            placeholder="Discount value"
            value={form.discountValue}
            onChange={(e) =>
              setForm((v) => ({ ...v, discountValue: Number(e.target.value || 0) }))
            }
            required
          />
          <input
            className="input-field"
            type="number"
            min={0}
            placeholder="Min order amount (optional)"
            value={form.minOrderAmount}
            onChange={(e) => setForm((v) => ({ ...v, minOrderAmount: e.target.value }))}
          />
          <input
            className="input-field"
            type="number"
            min={1}
            placeholder="Max uses (optional)"
            value={form.maxUses}
            onChange={(e) => setForm((v) => ({ ...v, maxUses: e.target.value }))}
          />
          <input
            className="input-field md:col-span-2"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((v) => ({ ...v, expiresAt: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((v) => ({ ...v, active: e.target.checked }))}
            />
            Active when created
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button className="admin-btn-primary mt-4" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Create coupon"}
        </button>
      </form>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-sm font-medium">All coupons ({coupons.length})</p>
        <div className="space-y-2">
          {coupons.map((coupon) => {
            const status = statusLabel(coupon);
            const isLive = status === "Active";

            return (
              <div
                key={coupon.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-bold tracking-wide text-[var(--color-primary)]">
                      {coupon.code}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        isLive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {coupon.label && (
                    <p className="mt-1 text-sm text-[var(--color-text)]">{coupon.label}</p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {formatDiscount(coupon)}
                    {coupon.minOrderAmount
                      ? ` · Min order ₹${coupon.minOrderAmount}`
                      : ""}
                    {coupon.maxUses
                      ? ` · Uses ${coupon.usedCount || 0}/${coupon.maxUses}`
                      : ""}
                    {coupon.expiresAt ? ` · Expires ${coupon.expiresAt}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className={`admin-btn-toggle ${coupon.active !== false ? "admin-btn-toggle-active" : ""}`}
                    onClick={() => toggleActive(coupon)}
                  >
                    {coupon.active === false ? "Activate" : "Active"}
                  </button>
                  <span className="px-1 text-[var(--color-border)]" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    className="admin-action-danger"
                    onClick={() => deleteCoupon(coupon)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {!coupons.length && (
            <p className="text-sm text-[var(--color-muted)]">No coupon codes yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
