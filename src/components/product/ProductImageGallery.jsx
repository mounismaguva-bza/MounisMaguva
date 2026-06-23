"use client";

import ProductImage from "@/components/product/ProductImage";
import ProductImageZoom from "@/components/product/ProductImageZoom";
import useEmblaCarousel from "embla-carousel-react";
import { createPortal } from "react-dom";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HotBadge from "@/components/product/HotBadge";
import { Button } from "@/components/ui/button";
import { getDisplayImageSrc } from "@/lib/image-cache";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DETAIL_ZOOM = 2.5;
const ZOOM_STEP = 0.35;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function ProductLightbox({
  open,
  images,
  alt,
  selectedIndex,
  zoomOrigin,
  onSelectIndex,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(DETAIL_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState(zoomOrigin);
  const panStart = useRef(null);
  const pinchStart = useRef(null);

  const [lightboxRef, lightboxApi] = useEmblaCarousel({ loop: images.length > 1 });

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    startTransition(() => {
      setOrigin(zoomOrigin);
      setZoom(DETAIL_ZOOM);
      setPan({ x: 0, y: 0 });
    });
  }, [open, zoomOrigin, selectedIndex]);

  useEffect(() => {
    if (!open || !lightboxApi) return;
    lightboxApi.scrollTo(selectedIndex, true);
  }, [open, lightboxApi, selectedIndex]);

  useEffect(() => {
    if (!lightboxApi || !open) return;

    const onSelect = () => {
      const index = lightboxApi.selectedScrollSnap();
      onSelectIndex(index);
      setZoom(DETAIL_ZOOM);
      setPan({ x: 0, y: 0 });
      setOrigin({ x: 50, y: 50 });
    };

    lightboxApi.on("select", onSelect);
    return () => lightboxApi.off("select", onSelect);
  }, [lightboxApi, open, onSelectIndex]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") lightboxApi?.scrollNext();
      if (event.key === "ArrowLeft") lightboxApi?.scrollPrev();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lightboxApi, onClose]);

  useEffect(() => {
    if (!lightboxApi) return;
    lightboxApi.reInit({ watchDrag: zoom <= 1 });
  }, [lightboxApi, zoom]);

  function adjustZoom(delta) {
    setZoom((current) => {
      const next = clamp(Number((current + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetView() {
    setZoom(DETAIL_ZOOM);
    setPan({ x: 0, y: 0 });
    setOrigin(zoomOrigin);
  }

  function handleWheel(event) {
    event.preventDefault();
    adjustZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function handlePointerDown(event) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
  }

  function handlePointerMove(event) {
    if (!panStart.current || zoom <= 1) return;
    setPan({
      x: event.clientX - panStart.current.x,
      y: event.clientY - panStart.current.y,
    });
  }

  function handlePointerUp(event) {
    panStart.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const [a, b] = event.touches;
      pinchStart.current = {
        distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        zoom,
      };
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length !== 2 || !pinchStart.current) return;
    event.preventDefault();
    const [a, b] = event.touches;
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
    if (zoom > DETAIL_ZOOM) {
      resetView();
    } else {
      setZoom(MAX_ZOOM);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Full detail image viewer"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2a2420_0%,_#000_65%)]" />

      <header className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-black/70 px-3 py-3 backdrop-blur-md sm:px-5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="shrink-0 rounded-full bg-white/95 px-3 text-[var(--color-text)] shadow-md hover:bg-white sm:px-4"
          aria-label="Back to product"
        >
          <ArrowLeft className="size-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-medium text-white">{alt}</p>
          <p className="text-xs text-white/55">
            Photo {selectedIndex + 1} of {images.length}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/15 bg-white/10 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-full text-white hover:bg-white/15"
            onClick={() => adjustZoom(-ZOOM_STEP)}
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </Button>
          <span className="min-w-11 text-center text-[11px] font-medium tabular-nums text-white/85">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-full text-white hover:bg-white/15"
            onClick={() => adjustZoom(ZOOM_STEP)}
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-full text-white hover:bg-white/15"
            onClick={resetView}
            aria-label="Reset view"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </header>

      <div className="relative z-10 min-h-0 flex-1" ref={lightboxRef} onWheel={handleWheel}>
        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-white/90 shadow-lg"
              onClick={() => lightboxApi?.scrollPrev()}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-white/90 shadow-lg"
              onClick={() => lightboxApi?.scrollNext()}
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}

        <div className="flex h-full">
          {images.map((src, index) => (
            <div
              key={`detail-${src}-${index}`}
              className="relative min-h-0 min-w-0 shrink-0 grow-0 basis-full overflow-hidden"
            >
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  zoom > 1 && "cursor-grab active:cursor-grabbing",
                )}
                onDoubleClick={handleDoubleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDisplayImageSrc(src, undefined, "zoom")}
                    alt={`${alt} — detail ${index + 1}`}
                    className="max-h-[calc(100vh-8rem)] max-w-[100vw] select-none object-contain"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="relative z-10 border-t border-white/10 bg-black/80 px-4 py-3">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {images.map((src, index) => (
              <button
                key={`detail-thumb-${src}-${index}`}
                type="button"
                onClick={() => {
                  lightboxApi?.scrollTo(index);
                  onSelectIndex(index);
                }}
                className={cn(
                  "relative h-14 w-12 shrink-0 overflow-hidden rounded-md border-2 bg-white/5",
                  selectedIndex === index
                    ? "border-white ring-2 ring-white/30"
                    : "border-white/20 opacity-70 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1}`}
              >
                <ProductImage
                  src={src}
                  alt=""
                  fill
                  displaySize="thumb"
                  className="object-contain p-0.5"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="relative z-10 border-t border-white/10 bg-black/70 px-4 py-2.5 text-center text-[11px] text-white/55 backdrop-blur-md">
        Drag to explore detail · Pinch or scroll to zoom · Double-tap for closer view
      </p>
    </div>,
    document.body,
  );
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false });

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

  function openLightbox(index = selectedIndex, origin = { x: 50, y: 50 }) {
    onSelectIndex(index);
    setZoomOrigin(origin);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  const thumbImageClass = "object-contain p-1";
  const mainImageClass = "object-contain p-4 sm:p-6";

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
                <ProductImage src={img} alt="" fill displaySize="thumb" className={thumbImageClass} sizes="72px" />
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
                      displaySize="full"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 620px"
                      className="absolute inset-0"
                      imageClassName={mainImageClass}
                      onOpenFullscreen={(origin) => openLightbox(i, origin)}
                    >
                      {i === selectedIndex && (isBestSeller || isNew) && (
                        <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                          {isBestSeller && <HotBadge />}
                          {isNew && <Badge variant="gold">New</Badge>}
                        </div>
                      )}
                      {i === selectedIndex && discount && (
                        <Badge
                          variant="sale"
                          className={cn(
                            "pointer-events-none absolute z-10",
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
                    mainApi?.scrollPrev();
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
                    mainApi?.scrollNext();
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
            <p className="mt-3 text-xs text-[var(--color-muted)] lg:mt-4">
              <span className="lg:hidden">Swipe to browse · {selectedIndex + 1} / {images.length}</span>
              <span className="hidden lg:inline">Hover to zoom · click where you want detail</span>
            </p>
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
                <ProductImage src={img} alt="" fill displaySize="thumb" className={thumbImageClass} sizes="64px" />
              </Button>
            ))}
          </div>
        </div>
      )}

      <ProductLightbox
        open={lightboxOpen}
        images={images}
        alt={alt}
        selectedIndex={selectedIndex}
        zoomOrigin={zoomOrigin}
        onSelectIndex={onSelectIndex}
        onClose={closeLightbox}
      />
    </section>
  );
}
