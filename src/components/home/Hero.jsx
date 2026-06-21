"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroImages } from "@/lib/hero-images";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;

function SlideDots({ count, index, onSelect, className }) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5 sm:gap-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index ? "true" : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(i);
          }}
          className="flex min-h-10 min-w-10 items-center justify-center p-2"
        >
          <span
            className={cn(
              "block size-2 rounded-full transition-all duration-300 sm:size-2.5",
              i === index ? "bg-white" : "bg-white/45",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function Hero() {
  const pathname = usePathname();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 25,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    watchResize: true,
  });
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef(null);

  const slides = heroImages;

  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!emblaApi) return;
    clearAutoplay();
    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
  }, [emblaApi, clearAutoplay]);

  const restartCarousel = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    setIndex(emblaApi.selectedScrollSnap());
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, slides.length]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncIndex = () => setIndex(emblaApi.selectedScrollSnap());
    const onSelect = () => {
      syncIndex();
      startAutoplay();
    };

    syncIndex();
    startAutoplay();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      clearAutoplay();
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, clearAutoplay, startAutoplay]);

  useEffect(() => {
    if (!emblaApi || pathname !== "/") return;

    const frame = requestAnimationFrame(() => {
      restartCarousel();
    });

    return () => cancelAnimationFrame(frame);
  }, [emblaApi, pathname, restartCarousel]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        restartCarousel();
      } else {
        clearAutoplay();
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        restartCarousel();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [emblaApi, restartCarousel, clearAutoplay]);

  const scrollTo = useCallback(
    (i) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi],
  );

  const handleSlideClick = useCallback(
    (event) => {
      if (!emblaApi?.clickAllowed()) {
        event.preventDefault();
      }
    },
    [emblaApi],
  );

  return (
    <section className="bg-[var(--color-cream)]">
      <div className="relative w-full">
        <div
          ref={emblaRef}
          className="relative h-[clamp(240px,52vw,900px)] w-full overflow-hidden sm:h-[clamp(280px,48vw,900px)] lg:h-[clamp(320px,44vw,920px)]"
        >
          <div className="flex h-full w-full touch-pan-y">
            {slides.map((slide, i) => (
              <Link
                key={slide.src}
                href={slide.href || "/shop"}
                onClick={handleSlideClick}
                className="relative block h-full min-w-0 shrink-0 grow-0 basis-full cursor-pointer"
                aria-label={`Shop now — ${slide.alt}`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  quality={95}
                  sizes="100vw"
                  className="object-cover object-center"
                  style={{
                    objectPosition: slide.objectPosition || "center center",
                  }}
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 z-10 sm:bottom-5">
          <SlideDots
            count={slides.length}
            index={index}
            onSelect={scrollTo}
          />
        </div>
      </div>
    </section>
  );
}
