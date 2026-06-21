"use client";

import ProductImage from "@/components/product/ProductImage";
import ProductImageZoom from "@/components/product/ProductImageZoom";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotBadge from "@/components/product/HotBadge";
import { Button } from "@/components/ui/button";
import { getDisplayImageSrc } from "@/lib/image-cache";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.35;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function ProductImageGallery({
  images,
  alt,
  isNew,
  isBestSeller,
  discount,
  selectedIndex,
  onSelectIndex,
  onShare,
  shareFeedback,
}) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const panStart = useRef(null);
  const pinchStart = useRef(null);

  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false });
  const [lightboxRef, lightboxApi] = useEmblaCarousel({ loop: true });

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setZoomOrigin({ x: 50, y: 50 });
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenOpen(false);
    resetZoom();
  }, [resetZoom]);

  const syncIndex = useCallback(
    (index) => {
      onSelectIndex(index);
      thumbsApi?.scrollTo(index);
    },
    [onSelectIndex, thumbsApi],
  );

  useEffect(() => {
    if (!mainApi) return;
    const onSelect = () => syncIndex(mainApi.selectedScrollSnap());
    mainApi.on("select", onSelect);
    mainApi.scrollTo(selectedIndex, true);
    return () => mainApi.off("select", onSelect);
  }, [mainApi, selectedIndex, syncIndex]);

  useEffect(() => {
    thumbsApi?.scrollTo(selectedIndex);
  }, [thumbsApi, selectedIndex]);

  useEffect(() => {
    if (!lightboxApi || !fullscreenOpen) return;

    const onSelect = () => {
      const index = lightboxApi.selectedScrollSnap();
      onSelectIndex(index);
      resetZoom();
      mainApi?.scrollTo(index, true);
      thumbsApi?.scrollTo(index);
    };

    lightboxApi.on("select", onSelect);
    lightboxApi.scrollTo(selectedIndex, true);
    return () => lightboxApi.off("select", onSelect);
  }, [
    lightboxApi,
    fullscreenOpen,
    selectedIndex,
    onSelectIndex,
    mainApi,
    thumbsApi,
    resetZoom,
  ]);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreenOpen]);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") lightboxApi?.scrollNext();
      if (e.key === "ArrowLeft") lightboxApi?.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreenOpen, lightboxApi, closeFullscreen]);

  useEffect(() => {
    if (!lightboxApi) return;
    lightboxApi.reInit({ watchDrag: zoom <= 1 });
  }, [lightboxApi, zoom]);

  function openFullscreen(index = selectedIndex, origin = { x: 50, y: 50 }) {
    onSelectIndex(index);
    setZoomOrigin(origin);
    setZoom(2);
    setPan({ x: 0, y: 0 });
    setFullscreenOpen(true);
  }

  function adjustZoom(delta) {
    setZoom((z) => {
      const next = clamp(Number((z + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function handleWheel(e) {
    if (!fullscreenOpen) return;
    e.preventDefault();
    adjustZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function handlePointerDown(e) {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }

  function handlePointerMove(e) {
    if (!panStart.current || zoom <= 1) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }

  function handlePointerUp(e) {
    panStart.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinchStart.current = {
        distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        zoom,
      };
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length !== 2 || !pinchStart.current) return;
    e.preventDefault();
    const [a, b] = e.touches;
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const scale = distance / pinchStart.current.distance;
    const next = clamp(
      Number((pinchStart.current.zoom * scale).toFixed(2)),
      MIN_ZOOM,
      MAX_ZOOM,
    );
    setZoom(next);
    if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
  }

  function handleTouchEnd() {
    pinchStart.current = null;
  }

  function handleDoubleClick() {
    if (zoom > 1) resetZoom();
    else setZoom(2);
  }

  function goToPrev() {
    if (!mainApi) return;
    mainApi.scrollPrev();
  }

  function goToNext() {
    if (!mainApi) return;
    mainApi.scrollNext();
  }

  const thumbButtonClass = (i) =>
    cn(
      "relative shrink-0 overflow-hidden p-0 transition-all",
      "h-16 w-14 sm:h-[4.5rem] sm:w-[3.75rem] lg:h-[4.25rem] lg:w-[3.5rem] xl:h-[4.75rem] xl:w-16",
      selectedIndex === i
        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/25 shadow-sm"
        : "border-[var(--color-border)] opacity-75 hover:opacity-100",
    );

  return (
    <section aria-label="Product images" className="space-y-3 lg:space-y-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 xl:gap-5">
        {images.length > 1 && (
          <div
            className="order-2 hidden max-h-[min(72vh,640px)] shrink-0 overflow-y-auto rounded-xl bg-[var(--color-cream)]/50 p-1.5 lg:order-1 lg:flex lg:flex-col lg:gap-2 xl:max-h-[min(78vh,720px)] 2xl:max-h-[min(80vh,780px)]"
            aria-label="Image thumbnails"
          >
            {images.map((img, i) => (
              <Button
                key={img}
                type="button"
                variant="outline"
                onClick={() => {
                  mainApi?.scrollTo(i);
                  syncIndex(i);
                }}
                className={thumbButtonClass(i)}
              >
                <ProductImage src={img} alt="" fill className="object-cover" sizes="72px" />
              </Button>
            ))}
          </div>
        )}

        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <div className="group/main relative overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-sm ring-1 ring-black/5">
            {onShare && (
              <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                className="absolute top-3 right-3 z-20 touch-manipulation rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                aria-label={
                  shareFeedback === "copied"
                    ? "Product link copied"
                    : shareFeedback === "shared"
                      ? "Product shared"
                      : "Share product"
                }
                title={
                  shareFeedback === "copied"
                    ? "Link copied!"
                    : shareFeedback === "shared"
                      ? "Shared!"
                      : "Share product"
                }
              >
                {shareFeedback === "copied" || shareFeedback === "shared" ? (
                  <Check className="size-5 text-emerald-600" />
                ) : (
                  <Share2 className="size-5 text-[var(--color-text)]" />
                )}
              </Button>
            )}
            <div className="overflow-hidden" ref={mainRef}>
              <div className="flex">
                {images.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-[4/5] min-w-0 shrink-0 grow-0 basis-full sm:aspect-[3/4] lg:aspect-[4/5] lg:max-h-[min(72vh,640px)] xl:max-h-[min(78vh,720px)] 2xl:max-h-[min(80vh,780px)]"
                  >
                    <ProductImageZoom
                      src={src}
                      alt={`${alt} — view ${i + 1}`}
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 620px"
                      className="absolute inset-0"
                      onOpenFullscreen={(origin) => openFullscreen(i, origin)}
                    >
                      {i === selectedIndex && (isBestSeller || isNew) && (
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                          {isBestSeller && <HotBadge />}
                          {isNew && <Badge variant="gold">New</Badge>}
                        </div>
                      )}
                      {i === selectedIndex && discount && (
                        <Badge
                          variant="sale"
                          className={cn(
                            "absolute z-10",
                            onShare ? "top-14 right-3" : "top-4 right-4",
                          )}
                        >
                          -{discount}%
                        </Badge>
                      )}
                    </ProductImageZoom>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 rounded-full bg-white/95 shadow-md backdrop-blur hover:bg-white lg:inline-flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-lg"
                  className="absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 rounded-full bg-white/95 shadow-md backdrop-blur hover:bg-white lg:inline-flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </Button>
                <div className="absolute bottom-3 left-3 z-10 hidden rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm lg:block">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted)] lg:mt-4">
              <span className="lg:hidden">
                Swipe to browse · {selectedIndex + 1} / {images.length}
              </span>
              <span className="hidden lg:inline">Use arrows or thumbnails to browse photos</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-[var(--color-primary)]"
                onClick={() => openFullscreen(selectedIndex)}
              >
                <Maximize2 className="size-3.5" />
                Fullscreen
              </Button>
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="overflow-hidden rounded-xl bg-[var(--color-cream)]/40 p-1 lg:hidden" ref={thumbsRef}>
          <div className="flex gap-2">
            {images.map((img, i) => (
              <Button
                key={img}
                type="button"
                variant="outline"
                onClick={() => {
                  mainApi?.scrollTo(i);
                  syncIndex(i);
                }}
                className={thumbButtonClass(i)}
              >
                <ProductImage src={img} alt="" fill className="object-cover" sizes="64px" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image gallery"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-white">
            <p className="text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={() => adjustZoom(-ZOOM_STEP)}
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={() => adjustZoom(ZOOM_STEP)}
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={resetZoom}
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={closeFullscreen}
                aria-label="Close gallery"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          <div
            className="relative min-h-0 flex-1"
            ref={lightboxRef}
            onWheel={handleWheel}
          >
            <div className="flex h-full">
              {images.map((src, i) => (
                <div
                  key={`lightbox-${src}`}
                  className="relative flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center"
                >
                  <div
                    className={cn(
                      "relative flex h-full w-full max-h-full max-w-full items-center justify-center transition-transform duration-100",
                      zoom > 1 && "cursor-grab active:cursor-grabbing",
                    )}
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    }}
                    onDoubleClick={handleDoubleClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDisplayImageSrc(src)}
                      alt={`${alt} — fullscreen ${i + 1}`}
                      className="max-h-[85vh] max-w-full object-contain select-none"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="border-t border-white/10 px-4 py-3 text-center text-xs text-white/70">
            Swipe to change image · Hover or click to zoom on desktop · Double-tap for fullscreen
          </p>
        </div>
      )}
    </section>
  );
}
