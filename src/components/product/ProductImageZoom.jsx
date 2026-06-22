"use client";

import { useCallback, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import ProductImage from "@/components/product/ProductImage";
import { cn } from "@/lib/utils";

const ZOOM_LEVEL = 2.35;
const LENS_SIZE = 112;

function getOriginFromEvent(container, clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
  return { x, y };
}

export default function ProductImageZoom({
  src,
  alt,
  className,
  imageClassName = "object-cover",
  priority,
  sizes,
  onOpenFullscreen,
  children,
}) {
  const containerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [canHoverZoom, setCanHoverZoom] = useState(false);

  const isZoomed = canHoverZoom && (hovering || pinned);

  const updateOrigin = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return;
    setOrigin(getOriginFromEvent(container, clientX, clientY));
  }, []);

  const handlePointerEnter = () => {
    setCanHoverZoom(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    setHovering(true);
  };

  const handleClick = (event) => {
    const nextOrigin = containerRef.current
      ? getOriginFromEvent(containerRef.current, event.clientX, event.clientY)
      : origin;

    if (!canHoverZoom) {
      onOpenFullscreen?.(nextOrigin);
      return;
    }

    setOrigin(nextOrigin);

    if (pinned) {
      setPinned(false);
      return;
    }

    setPinned(true);
  };

  const handleDoubleClick = (event) => {
    event.preventDefault();
    const nextOrigin = containerRef.current
      ? getOriginFromEvent(containerRef.current, event.clientX, event.clientY)
      : origin;
    setOrigin(nextOrigin);
    onOpenFullscreen?.(nextOrigin);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-[var(--color-surface)]",
        canHoverZoom && (pinned ? "cursor-zoom-out" : "cursor-crosshair"),
        !canHoverZoom && "cursor-zoom-in",
        className,
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setHovering(false)}
      onPointerMove={(event) => {
        if (canHoverZoom && !pinned) {
          updateOrigin(event.clientX, event.clientY);
        }
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenFullscreen?.(origin);
        }
      }}
      aria-label="Zoom product image. Hover to magnify, click to pin, double-click for fullscreen."
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-200 ease-out",
          isZoomed && "will-change-transform",
        )}
        style={{
          transform: isZoomed ? `scale(${ZOOM_LEVEL})` : "scale(1)",
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
      >
        <ProductImage
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          priority={priority}
          sizes={sizes}
        />
      </div>

      {isZoomed && hovering && !pinned ? (
        <div
          className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/95 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-black/10 backdrop-blur-[1px]"
          style={{
            left: `${origin.x}%`,
            top: `${origin.y}%`,
            width: LENS_SIZE,
            height: LENS_SIZE,
          }}
          aria-hidden
        />
      ) : null}

      {children}

      <div
        className={cn(
          "pointer-events-none absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity",
          canHoverZoom ? "opacity-100" : "opacity-90",
        )}
      >
        <ZoomIn className="size-3.5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">
          {canHoverZoom
            ? pinned
              ? "Click to reset zoom"
              : "Hover to zoom · Click to pin"
            : "Tap to zoom"}
        </span>
        <span className="sm:hidden">Tap to zoom</span>
      </div>
    </div>
  );
}
