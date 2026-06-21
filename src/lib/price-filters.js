/**
 * @param {Array<{ price?: number }>} products
 */
export function getProductPriceBounds(products) {
  const prices = products
    .map((product) => Number(product.price) || 0)
    .filter((price) => price > 0);

  if (!prices.length) {
    return { min: 0, max: 10000 };
  }

  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const min = Math.max(0, Math.floor(rawMin / 50) * 50);
  const max = Math.max(min + 50, Math.ceil(rawMax / 50) * 50);

  return { min, max };
}

/**
 * @param {Array<{ price?: number }>} products
 * @param {number} minPrice
 * @param {number} maxPrice
 */
export function filterProductsByPriceBounds(products, minPrice, maxPrice) {
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || 0;

  return products.filter((product) => {
    const price = Number(product.price) || 0;
    return price >= min && price <= max;
  });
}

export function clampPrice(value, floor, ceiling) {
  const number = Number(value);
  if (!Number.isFinite(number)) return floor;
  return Math.min(ceiling, Math.max(floor, Math.round(number)));
}

export function normalizePriceRange(min, max, bounds) {
  let nextMin = clampPrice(min, bounds.min, bounds.max);
  let nextMax = clampPrice(max, bounds.min, bounds.max);

  if (nextMin > nextMax) {
    if (min === nextMin) {
      nextMin = nextMax;
    } else {
      nextMax = nextMin;
    }
  }

  return { min: nextMin, max: nextMax };
}
