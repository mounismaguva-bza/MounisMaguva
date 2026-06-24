import ProductCacheWarmer from "@/components/shop/ProductCacheWarmer";
import ProductDetail from "@/components/product/ProductDetail";
import { getProductThumbnail } from "@/lib/product-images";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { site } from "@/lib/site";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  const description =
    product.description ||
    `Buy ${product.name} online at ${site.name}. Best ethnic wear — SKU ${product.sku}. Free shipping across India.`;
  const image = getProductThumbnail(product);
  const path = `/product/${slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      url: path,
      type: "website",
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <ProductCacheWarmer products={[product, ...related]} />
      <ProductDetail product={product} related={related} />
    </>
  );
}
