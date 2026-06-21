"use client";

import { useMemo, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import PriceRangeFilter from "@/components/shop/PriceRangeFilter";
import {
  filterProductsByPriceBounds,
  getProductPriceBounds,
} from "@/lib/price-filters";

function ShopCatalogContent({
  products,
  bounds,
  emptyMessage,
  showCount,
}) {
  const [minPrice, setMinPrice] = useState(bounds.min);
  const [maxPrice, setMaxPrice] = useState(bounds.max);

  const filteredProducts = useMemo(
    () => filterProductsByPriceBounds(products, minPrice, maxPrice),
    [products, minPrice, maxPrice],
  );

  const isFiltered = minPrice > bounds.min || maxPrice < bounds.max;
  const noResultsMessage = isFiltered
    ? "No products in this price range. Try adjusting the slider."
    : emptyMessage;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-12">
      <aside className="mb-8 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:mb-0">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)]">
          Filters
        </h2>
        <div className="mt-5">
          <PriceRangeFilter
            bounds={bounds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChange={({ min, max }) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setMinPrice(bounds.min);
              setMaxPrice(bounds.max);
            }}
            className="mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Clear price filter
          </button>
        )}
      </aside>

      <div className="min-w-0">
        {showCount && (
          <p className="mb-6 text-sm text-[var(--color-muted)]">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}
        <ProductGrid products={filteredProducts} emptyMessage={noResultsMessage} />
      </div>
    </div>
  );
}

export default function ShopCatalog({
  products,
  emptyMessage = "No products found.",
  showCount = true,
}) {
  const bounds = useMemo(() => getProductPriceBounds(products), [products]);
  const boundsKey = `${bounds.min}-${bounds.max}`;

  return (
    <ShopCatalogContent
      key={boundsKey}
      products={products}
      bounds={bounds}
      emptyMessage={emptyMessage}
      showCount={showCount}
    />
  );
}
