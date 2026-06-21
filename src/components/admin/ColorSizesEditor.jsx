"use client";

import { MultiSuggestionField } from "@/components/admin/SuggestionField";
const SIZE_SUGGESTIONS = ["Free Size", "S", "M", "L", "XL", "XXL"];

export default function ColorSizesEditor({ colors, colorSizes, onChange }) {
  if (!colors.length) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Add at least one color to set available sizes per color.
      </p>
    );
  }

  function setForColor(color, nextSizes) {
    const updated = { ...(colorSizes || {}) };
    if (nextSizes && nextSizes.length) {
      updated[color] = nextSizes;
    } else {
      delete updated[color];
    }
    onChange(updated);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">Sizes per color</legend>
      <p className="text-xs text-[var(--color-muted)]">
        Select which sizes are available when a shopper chooses each color.
        If empty for a color, we fall back to the product&apos;s global sizes.
      </p>

      <div className="space-y-4">
        {colors.map((color) => {
          const values = colorSizes?.[color] || [];
          return (
            <div
              key={color}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)]/30 p-3"
            >
              <p className="mb-2 text-sm font-semibold text-[var(--color-primary)]">{color}</p>
              <MultiSuggestionField
                legend=""
                placeholder="Start typing size..."
                suggestions={SIZE_SUGGESTIONS}
                values={values}
                onAdd={(size) => setForColor(color, [...values, size])}
                onRemove={(size) => setForColor(color, values.filter((s) => s !== size))}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

