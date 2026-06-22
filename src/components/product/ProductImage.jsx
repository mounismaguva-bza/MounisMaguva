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
  ...props
}) {
  const displaySrc = useMemo(
    () => getDisplayImageSrc(src, fallback),
    [src, fallback],
  );
  const unoptimized = useMemo(
    () => shouldBypassNextImageOptimizer(displaySrc),
    [displaySrc],
  );

  useEffect(() => {
    warmImage(displaySrc);
  }, [displaySrc]);

  if (!displaySrc) return null;

  return (
    <Image
      src={displaySrc}
      alt={alt}
      unoptimized={unoptimized}
      className={cn(className)}
      {...props}
    />
  );
}
