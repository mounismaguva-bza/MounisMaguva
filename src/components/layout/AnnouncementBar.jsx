"use client";

import { useEffect, useState } from "react";
import { announcements } from "@/lib/site";

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="bg-[var(--color-primary)] text-[var(--color-cream)] text-center text-xs sm:text-sm py-2.5 px-4 tracking-wide"
      role="region"
      aria-live="polite"
      aria-label="Store announcements"
    >
      <p className="animate-fade-in font-medium">{announcements[index]}</p>
    </div>
  );
}
