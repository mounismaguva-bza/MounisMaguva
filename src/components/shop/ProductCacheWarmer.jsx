"use client";

import { useEffect } from "react";
import { scheduleBackgroundTask } from "@/lib/background-task";
import {
  cacheProductsInBackground,
  setCachedProducts,
} from "@/lib/products-cache";

/**
 * Saves catalog to localStorage right after mount, then prefetches images in idle time.
 */
export default function ProductCacheWarmer({ products = [] }) {
  useEffect(() => {
    if (!products.length) return undefined;

    // Write immediately so DevTools / repeat visits see cache without waiting for idle.
    setCachedProducts(products);

    let cancelBatch = () => {};
    const cancelSchedule = scheduleBackgroundTask(() => {
      cancelBatch = cacheProductsInBackground(products);
    });

    return () => {
      cancelSchedule();
      cancelBatch();
    };
  }, [products]);

  return null;
}
