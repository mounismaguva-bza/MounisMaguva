"use client";

import ProductImage from "@/components/product/ProductImage";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  CreditCard,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatDiscount, formatPrice } from "@/lib/format";
import {
  getColorOptions,
} from "@/lib/product-details";
import {
  getWhatsAppInquiryUrl,
  getWhatsAppOrderUrl,
  openWhatsApp,
} from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import HotBadge from "@/components/product/HotBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProductDetailsSection from "@/components/product/ProductDetailsSection";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductCard from "@/components/product/ProductCard";
import { getImagesForColor, getProductThumbnail } from "@/lib/product-images";
import { shareProduct } from "@/lib/share-product";
import { cn } from "@/lib/utils";

const WISHLIST_KEY = "maguva-wishlist";

export default function ProductDetail({ product, related = [] }) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const colorOptions = useMemo(() => getColorOptions(product), [product]);
  const [selectedColorId, setSelectedColorId] = useState(
    colorOptions.find((c) => c.available)?.id ?? colorOptions[0]?.id,
  );
  const [wishlisted, setWishlisted] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  const selectedColor =
    colorOptions.find((c) => c.id === selectedColorId) ?? colorOptions[0];

  const galleryImages = useMemo(
    () => getImagesForColor(product, selectedColor?.label),
    [product, selectedColor?.label],
  );

  const colorSamples = useMemo(
    () =>
      colorOptions.map((opt) => ({
        ...opt,
        sampleImage:
          getImagesForColor(product, opt.label)[0] || getProductThumbnail(product),
      })),
    [product, colorOptions],
  );

  const sizesForSelectedColor = useMemo(() => {
    const label = selectedColor?.label;
    const override = label && product?.colorSizes?.[label];
    if (Array.isArray(override) && override.length) return override;
    return Array.isArray(product?.sizes) ? product.sizes : [];
  }, [product, selectedColor?.label]);

  useEffect(() => {
    startTransition(() => {
      setSelectedImage(0);
      setSize((prev) =>
        sizesForSelectedColor.includes(prev)
          ? prev
          : sizesForSelectedColor[0] || "",
      );
    });
  }, [selectedColorId, sizesForSelectedColor]);

  const discount = formatDiscount(product.originalPrice, product.price);
  const referenceImage = galleryImages[0] || getProductThumbnail(product);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const list = raw ? JSON.parse(raw) : [];
      startTransition(() => {
        setWishlisted(Array.isArray(list) && list.includes(product.id));
      });
    } catch {
      startTransition(() => setWishlisted(false));
    }
  }, [product.id]);

  function buildCartPayload() {
    const colorLabel = selectedColor?.label ?? product.color;
    return {
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: `${product.name} (${colorLabel})`,
      price: product.price,
      image: galleryImages[0] || getProductThumbnail(product),
      size,
      quantity,
    };
  }

  function handleAddToCart() {
    if (!product.inStock || !selectedColor?.available) return;
    addItem(buildCartPayload());
  }

  function handleBuyNow() {
    if (!product.inStock || !selectedColor?.available) return;
    const item = buildCartPayload();
    addItem(item);
    const url = getWhatsAppOrderUrl([item], {
      note: `Buy now — Color: ${selectedColor.label}`,
    });
    openWhatsApp(url, { copyImageSources: [item.image] });
  }

  function handleWhatsAppInquiry() {
    const url = getWhatsAppInquiryUrl(
      product.name,
      product.sku,
      referenceImage,
      product.slug,
    );
    openWhatsApp(url, { copyImageSources: [referenceImage] });
  }

  async function handleShareProduct() {
    const colorLabel = selectedColor?.label ?? product.color;
    const result = await shareProduct({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      image: referenceImage,
      colorLabel,
    });

    if (result === "cancelled") return;

    if (result === "shared") {
      setShareStatus("shared");
    } else if (result === "copied") {
      setShareStatus("copied");
    } else {
      setShareStatus("failed");
    }

    window.setTimeout(() => setShareStatus(null), 2500);
  }

  function toggleWishlist() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setWishlisted(false);
      } else {
        list.push(product.id);
        setWishlisted(true);
      }
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  const canPurchase = product.inStock && selectedColor?.available;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:max-w-[88rem] xl:py-12">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)] lg:mb-7">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link href="/shop" className="hover:text-[var(--color-primary)]">
          Shop
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/shop/${product.category}`}
          className="hover:text-[var(--color-primary)] capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight className="size-3" />
        <span className="line-clamp-1 text-[var(--color-text)]">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:gap-12 2xl:gap-14">
        <div className="min-w-0 lg:sticky lg:top-20 lg:self-start xl:top-24">
          <ProductImageGallery
            images={galleryImages.length ? galleryImages : [getProductThumbnail(product)]}
            alt={product.name}
            isNew={product.isNew}
            isBestSeller={product.isBestSeller}
            discount={discount}
            selectedIndex={selectedImage}
            onSelectIndex={setSelectedImage}
            onShare={handleShareProduct}
            shareFeedback={shareStatus}
          />
        </div>

        <div className="min-w-0">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6 lg:p-6 xl:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] sm:text-xs">
              {product.sku}
            </p>
            <h1 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-text)] sm:text-3xl lg:text-[1.85rem] lg:leading-snug xl:text-[2rem] 2xl:text-4xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted)] lg:mt-4 lg:line-clamp-2 xl:line-clamp-3">
                {product.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2 border-b border-[var(--color-border)] pb-4 sm:mt-5 sm:gap-3 sm:pb-5">
              <span className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl xl:text-[2rem] 2xl:text-4xl">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-[var(--color-muted)] line-through sm:text-lg">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {discount && <Badge variant="sale">-{discount}%</Badge>}
                {product.isBestSeller && <HotBadge />}
                {product.isNew && <Badge variant="gold">New</Badge>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
              {product.inStock ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Out of Stock
                </span>
              )}
              {selectedColor?.label && (
                <span className="text-sm text-[var(--color-muted)]">
                  Color:{" "}
                  <span className="font-medium capitalize text-[var(--color-text)]">
                    {selectedColor.label}
                  </span>
                </span>
              )}
            </div>

          {colorOptions.length > 0 && (
            <div className="mt-6 lg:mt-7">
              <Label className="mb-2.5 block text-sm font-semibold text-[var(--color-text)]">
                Choose color
              </Label>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {colorSamples.map((opt) => {
                  const isSelected = selectedColorId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!opt.available}
                      onClick={() => setSelectedColorId(opt.id)}
                      className={cn(
                        "flex w-[5.75rem] shrink-0 flex-col overflow-hidden rounded-lg border-2 bg-white text-left transition-all duration-200 sm:w-[6.25rem] md:w-[6.75rem] lg:w-[7rem]",
                        isSelected
                          ? "border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]/15"
                          : "border-[var(--color-border)] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:shadow-sm",
                        !opt.available && "cursor-not-allowed opacity-50 hover:translate-y-0",
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Color ${opt.label}`}
                    >
                      <div className="relative aspect-[3/4] h-20 w-full bg-[var(--color-surface)] sm:h-[5.5rem] md:h-24 lg:h-[6.5rem]">
                        <ProductImage
                          src={opt.sampleImage}
                          alt={`${product.name} — ${opt.label}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 639px) 88px, (max-width: 1023px) 100px, 112px"
                        />
                        {!opt.available && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                            Out of stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 border-t border-[var(--color-border)] px-1.5 py-1.5 sm:px-2 sm:py-1.5">
                        <span
                          className="size-3 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <span className="line-clamp-2 flex-1 text-[10px] font-medium capitalize leading-snug text-[var(--color-text)]">
                          {opt.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2 sm:gap-6">
            <div>
              <Label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Size
              </Label>
              <div className="flex flex-wrap gap-2">
                {sizesForSelectedColor.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-[4.5rem] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors sm:min-w-[5.5rem] sm:px-4 sm:py-2.5",
                      size === s
                        ? "border-[var(--color-primary)] bg-white text-[var(--color-primary)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)]/40",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
                Quantity
              </Label>
              <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-l-lg"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-r-lg"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-6 lg:mt-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="brand"
                size="block"
                type="button"
                className="touch-manipulation rounded-lg"
                disabled={!canPurchase}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="size-5" />
                Add to Cart
              </Button>
              <Button
                variant="buyNow"
                size="block"
                type="button"
                className="touch-manipulation"
                disabled={!canPurchase}
                onClick={handleBuyNow}
              >
                <CreditCard className="size-5" />
                Buy Now
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="brandOutline"
                size="block"
                type="button"
                className="touch-manipulation rounded-lg bg-white"
                onClick={toggleWishlist}
              >
                <Heart
                  className={cn("size-5", wishlisted && "fill-[var(--color-primary)]")}
                />
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </Button>
              <Button
                variant="outline"
                size="block"
                type="button"
                className="touch-manipulation rounded-lg border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)]/40"
                onClick={handleWhatsAppInquiry}
              >
                Chat on WhatsApp
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <ProductDetailsSection product={product} colorCount={colorOptions.length} />

      {related.length > 0 && (
        <section className="mt-12 border-t border-[var(--color-border)] pt-10 lg:mt-14 lg:pt-12 xl:mt-16">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
            <h2 className="section-title">You may also like</h2>
            <Link
              href={`/shop/${product.category}`}
              className="text-sm font-medium capitalize text-[var(--color-primary)] hover:underline"
            >
              View more in {product.category}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
