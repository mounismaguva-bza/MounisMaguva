import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { canAddProduct, MAX_PRODUCTS } from "@/lib/product-limits";

export default async function AdminProductCreatePage() {
  const allowed = await canAddProduct();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Add Product
        </h1>
        <Link href="/admin/products" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Back to products
        </Link>
      </div>

      {allowed ? (
        <ProductForm mode="create" />
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-medium">Product limit reached</p>
          <p className="mt-2">
            You can only have {MAX_PRODUCTS} products. Delete an existing product before adding a
            new one.
          </p>
          <Link href="/admin/products" className="admin-btn-primary mt-4 inline-flex">
            Back to products
          </Link>
        </div>
      )}
    </section>
  );
}
