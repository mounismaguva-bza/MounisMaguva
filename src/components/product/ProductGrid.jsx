import ProductCard from "./ProductCard";

export default function ProductGrid({ products, emptyMessage = "No products found." }) {
  if (!products?.length) {
    return (
      <p className="text-center py-16 text-[var(--color-muted)]">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard
          key={`${product.id}-${product.updatedAt ?? ""}`}
          product={product}
        />
      ))}
    </div>
  );
}
