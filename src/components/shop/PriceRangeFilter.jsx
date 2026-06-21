"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  clampPrice,
  normalizePriceRange,
} from "@/lib/price-filters";
import { cn } from "@/lib/utils";

function PriceInput({ label, value, onChange, onBlur }) {
  return (
    <label className="block flex-1">
      <span className="sr-only">{label}</span>
      <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
        <span className="text-sm text-[var(--color-muted)]">₹</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="w-full min-w-0 border-0 bg-transparent pl-1 text-sm text-[var(--color-text)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </label>
  );
}

export default function PriceRangeFilter({
  bounds,
  minPrice,
  maxPrice,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(true);
  const minId = useId();
  const maxId = useId();

  const rangeMin = Math.min(minPrice, maxPrice);
  const rangeMax = Math.max(minPrice, maxPrice);
  const span = Math.max(bounds.max - bounds.min, 1);
  const minPercent = ((rangeMin - bounds.min) / span) * 100;
  const maxPercent = ((rangeMax - bounds.min) / span) * 100;

  function updateRange(nextMin, nextMax) {
    onChange(normalizePriceRange(nextMin, nextMax, bounds));
  }

  function handleMinInput(value) {
    updateRange(clampPrice(value, bounds.min, bounds.max), maxPrice);
  }

  function handleMaxInput(value) {
    updateRange(minPrice, clampPrice(value, bounds.min, bounds.max));
  }

  function commitInputs() {
    updateRange(minPrice, maxPrice);
  }

  return (
    <div className={cn("border-b border-[var(--color-border)] pb-5", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-sm font-medium text-[var(--color-text)]">Price</span>
        {open ? (
          <ChevronUp className="size-4 text-[var(--color-muted)]" />
        ) : (
          <ChevronDown className="size-4 text-[var(--color-muted)]" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          <div className="relative h-7 px-1">
            <div className="absolute left-1 right-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-border)]" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(maxPercent - minPercent, 0)}%`,
              }}
            />
            <input
              id={minId}
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={50}
              value={rangeMin}
              onChange={(event) =>
                updateRange(Number(event.target.value), rangeMax)
              }
              className="price-range-thumb absolute inset-x-0 top-0 z-20 w-full outline-none"
            />
            <input
              id={maxId}
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={50}
              value={rangeMax}
              onChange={(event) =>
                updateRange(rangeMin, Number(event.target.value))
              }
              className="price-range-thumb absolute inset-x-0 top-0 z-30 w-full outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <PriceInput
              label="Minimum price"
              value={minPrice}
              onChange={handleMinInput}
              onBlur={commitInputs}
            />
            <span className="shrink-0 text-sm text-[var(--color-muted)]">To</span>
            <PriceInput
              label="Maximum price"
              value={maxPrice}
              onChange={handleMaxInput}
              onBlur={commitInputs}
            />
          </div>
        </div>
      )}
    </div>
  );
}
