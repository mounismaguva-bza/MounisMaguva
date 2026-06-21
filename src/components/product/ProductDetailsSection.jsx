"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import ProductInfoCards from "@/components/product/ProductInfoCards";
import { dedupeSpecs, parseProductDescription } from "@/lib/product-description";
import { cn } from "@/lib/utils";

const INTRO_COLLAPSE_CHARS = 320;

function AboutBlock({ text }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > INTRO_COLLAPSE_CHARS;

  if (!text.trim()) return null;

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]/80">
        About
      </h3>
      <div
        className={cn(
          "relative mt-3 text-sm leading-relaxed text-[var(--color-text)]",
          !expanded && isLong && "max-h-32 overflow-hidden",
        )}
      >
        <p className="whitespace-pre-line">{text}</p>
        {!expanded && isLong && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
            aria-hidden
          />
        )}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
        </button>
      )}
    </article>
  );
}

function SpecCard({ label, value }) {
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]/80">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text)]">{value}</p>
    </li>
  );
}

export default function ProductDetailsSection({ product, colorCount }) {
  const { intro, specs: parsedSpecs } = useMemo(
    () => parseProductDescription(product.description),
    [product.description],
  );

  const specs = useMemo(() => {
    const items = [...parsedSpecs];

    if (product.fabric?.trim()) {
      items.unshift({ label: "Fabric", value: product.fabric.trim() });
    }

    if (product.blouse?.trim()) {
      items.push({ label: "Blouse", value: product.blouse.trim() });
    }

    if (product.sizes?.length) {
      items.push({
        label: "Available sizes",
        value: product.sizes.join(" · "),
      });
    }

    if (colorCount > 0) {
      items.push({
        label: "Colors",
        value: `${colorCount} shade${colorCount > 1 ? "s" : ""} available`,
      });
    }

    return dedupeSpecs(items);
  }, [parsedSpecs, product.fabric, product.blouse, product.sizes, colorCount]);

  const hasAbout = Boolean(intro.trim());
  const hasSpecs = specs.length > 0;

  if (!hasAbout && !hasSpecs) {
    return (
      <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white/60 p-5 sm:p-6 lg:mt-12 lg:p-8 xl:mt-14">
        <ProductInfoCards />
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white/60 p-5 sm:p-6 lg:mt-12 lg:p-8 xl:mt-14">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-primary)] sm:text-2xl">
          Product details
        </h2>
        <p className="text-xs text-[var(--color-muted)]">
          Fabric, fit, and care information
        </p>
      </div>

      <div className="space-y-4 lg:space-y-5">
        {hasAbout && <AboutBlock text={intro} />}

        {hasSpecs && (
          <ul
            className={cn(
              "grid gap-3 sm:gap-4",
              specs.length === 1 && "grid-cols-1",
              specs.length === 2 && "sm:grid-cols-2",
              specs.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {specs.map((item) => (
              <SpecCard key={item.label} label={item.label} value={item.value} />
            ))}
          </ul>
        )}
      </div>

      <ProductInfoCards />
    </div>
  );
}
