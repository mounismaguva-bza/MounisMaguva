"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LAUNCH_HOME_REVEAL_MS,
  LAUNCH_TRANSITION_KEY,
} from "@/lib/launch";
import LaunchTransitionEmblem from "./LaunchTransitionEmblem";

export default function LaunchHomeEntrance() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (pathname !== "/") {
      handledRef.current = false;
      return;
    }
    if (handledRef.current) return;

    let fromLaunch = false;
    try {
      fromLaunch = sessionStorage.getItem(LAUNCH_TRANSITION_KEY) != null;
      if (fromLaunch) sessionStorage.removeItem(LAUNCH_TRANSITION_KEY);
    } catch {
      fromLaunch = false;
    }

    if (!fromLaunch) return;

    handledRef.current = true;
    document.documentElement.classList.add("home-from-launch");
    setActive(true);

    const timer = window.setTimeout(() => {
      setActive(false);
      document.documentElement.classList.remove("home-from-launch");
    }, LAUNCH_HOME_REVEAL_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className="launch-home-curtain-layer pointer-events-none fixed inset-0 z-[200]"
      aria-hidden
    >
      <div className="launch-home-sweep absolute inset-0 z-[45]" aria-hidden />
      <div className="absolute inset-0 z-[50] flex items-center justify-center px-6">
        <LaunchTransitionEmblem className="launch-home-emblem" />
      </div>
      <div className="launch-curtain launch-curtain-left launch-curtain-open-left" />
      <div className="launch-curtain launch-curtain-right launch-curtain-open-right" />
    </div>
  );
}
