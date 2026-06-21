import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { COLLECTIONS, getDocument } from "@/lib/firestore";

export default async function AdminProductEditPage({ params }) {
  const { id } = await params;
  const product = await getDocument(COLLECTIONS.products, id);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          Edit Product
        </h1>
        <Link href="/admin/products" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Back to products
        </Link>
      </div>
      <ProductForm mode="edit" product={product || { id }} />
    </section>
  );
}
