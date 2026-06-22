"use client";

import ProductImage from "@/components/product/ProductImage";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { formatDiscount, formatPrice } from "@/lib/format";
import { getProductCardImages, getProductThumbnail, hasProductImages } from "@/lib/product-images";
import { Badge } from "@/components/ui/badge";
import HotBadge from "@/components/product/HotBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discount = formatDiscount(product.originalPrice, product.price);
  const defaultSize = product.sizes?.[0] || "Free Size";
  const { primary, hover } = useMemo(
    () => getProductCardImages(product),
    [product],
  );
  const hasImages = hasProductImages(product);
  const thumbnail = primary || getProductThumbnail(product);

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      price: product.price,
      image: thumbnail,
      size: defaultSize,
      quantity: 1,
    });
  }

  function stopCardNavigation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <Card className="group/card overflow-hidden border-0 bg-transparent py-0 shadow-none">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--color-surface)]">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={primary}
            alt={product.name}
            fill
            className={cn(
              "transition-all duration-500",
              hasImages ? "object-cover" : "object-contain p-8",
              hover
                ? "opacity-100 group-hover/card:opacity-0 group-hover/card:scale-105"
                : "group-hover/card:scale-105",
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {hasImages && hover && (
            <ProductImage
              src={hover}
              alt={`${product.name} — alternate view`}
              fill
              className="object-cover opacity-0 transition-all duration-500 group-hover/card:scale-105 group-hover/card:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 z-[1] flex flex-col gap-1.5">
          {product.isBestSeller && <HotBadge />}
          {product.isNew && (
            <Badge variant="gold">New</Badge>
          )}
        </div>
        {discount && (
          <Badge variant="sale" className="pointer-events-none absolute top-3 right-3 z-[1]">
            -{discount}%
          </Badge>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden translate-y-full p-3 transition-transform duration-300 group-hover/card:translate-y-0 sm:block">
          <Button
            type="button"
            variant="secondary"
            className="pointer-events-auto w-full touch-manipulation bg-white/95 shadow-lg backdrop-blur hover:bg-[var(--color-primary)] hover:text-white"
            onClick={handleAddToCart}
            onPointerDown={stopCardNavigation}
          >
            Add to Bag
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="brand"
        size="block"
        className="mt-2.5 w-full rounded-lg sm:hidden"
        onClick={handleAddToCart}
        onPointerDown={stopCardNavigation}
      >
        Add to Bag
      </Button>

      <Link href={`/product/${product.slug}`} className="block px-0.5 pt-2 sm:pt-3">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {product.sku}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover/card:text-[var(--color-primary)]">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold text-[var(--color-primary)]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[var(--color-muted)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}
