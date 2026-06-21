"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const AUTOPLAY_MS = 2500;

export default function ProductScroll({
  products,
  emptyMessage = "No products found.",
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
  });

  const scrollNextOrReset = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const timer = setInterval(scrollNextOrReset, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [emblaApi, isPaused, scrollNextOrReset]);

  if (!products?.length) {
    return (
      <p className="text-center py-16 text-[var(--color-muted)]">{emptyMessage}</p>
    );
  }

  return (
    <div
      className="group/carousel relative min-w-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-x gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_calc((100%-1rem)/2)] sm:flex-[0_0_14rem] md:flex-[0_0_16rem] lg:flex-[0_0_18rem]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Scroll products left"
        className="absolute -left-2 top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-md ring-1 ring-black/5 transition-opacity hover:bg-[var(--color-cream)] active:scale-95 sm:-left-4 sm:size-11 opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={scrollNextOrReset}
        aria-label="Scroll products right"
        className="absolute -right-2 top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--color-primary)] shadow-md ring-1 ring-black/5 transition-opacity hover:bg-[var(--color-cream)] active:scale-95 sm:-right-4 sm:size-11 opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
