"use client";

import { useEffect } from "react";
import { cacheProductsAndWarmImages } from "@/lib/products-cache";

/**
 * Saves the product catalog to localStorage and prefetches Cloudinary images
 * so repeat visits reuse the browser cache with fewer Cloudinary requests.
 */
export default function ProductCacheWarmer({ products = [] }) {
  useEffect(() => {
    cacheProductsAndWarmImages(products);
  }, [products]);

  return null;
}
