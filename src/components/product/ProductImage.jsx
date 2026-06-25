"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import {
  getDisplayImageSrc,
  shouldBypassNextImageOptimizer,
  warmImage,
} from "@/lib/image-cache";
import { cn } from "@/lib/utils";

export default function ProductImage({
  src,
  alt,
  className,
  fallback,
  displaySize = "full",
  cacheKey,
  quality = 100,
  ...props
}) {
  const displaySrc = useMemo(
    () => getDisplayImageSrc(src, fallback, displaySize, cacheKey),
    [src, fallback, displaySize, cacheKey],
  );
  const unoptimized = useMemo(
    () => shouldBypassNextImageOptimizer(src, displaySize),
    [src, displaySize],
  );

  useEffect(() => {
    warmImage(displaySrc);
  }, [displaySrc]);

  if (!displaySrc) return null;

  return (
    <Image
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      unoptimized={unoptimized}
      quality={quality}
      className={cn(className)}
      {...props}
    />
  );
}
