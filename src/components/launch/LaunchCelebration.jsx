"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LAUNCH_EXIT_DURATION_MS, LAUNCH_REDIRECT_DELAY_MS, LAUNCH_TRANSITION_KEY } from "@/lib/launch";
import { heroImages } from "@/lib/hero-images";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import ConfettiBurst from "./ConfettiBurst";
import LaunchGoldDust from "./LaunchGoldDust";
import LaunchTransitionEmblem from "./LaunchTransitionEmblem";

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function splitMinutesSeconds(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  };
}

function FlipPair({ value, label, index }) {
  const digits = pad(value).split("");

  return (
    <div
      className="launch-countdown-unit flex flex-col items-center gap-3 sm:gap-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {digits.map((digit, digitIndex) => (
          <div
            key={`${label}-${digitIndex}`}
            className="launch-flip-slot overflow-hidden"
          >
            <span key={`${label}-${digitIndex}-${digit}`} className="launch-flip-digit">
              {digit}
            </span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-cream)]/50 sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

function CountdownProgress({ progress }) {
  return (
    <div className="mx-auto mt-6 w-full max-w-[220px] sm:mt-7 sm:max-w-[260px]">
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-[var(--color-cream)]/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/80 to-[var(--color-cream)]/40 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function BrandLogo({ celebrating }) {
  return (
    <div
      className={cn(
        "launch-logo-wrap launch-fade-up relative mx-auto w-fit",
        celebrating && "launch-logo-celebrate",
      )}
    >
      <div className="relative">
        <div className="launch-logo-halo" aria-hidden />
        {celebrating && <div className="launch-logo-burst launch-logo-burst-subtle" aria-hidden />}

        <div className="launch-logo-emblem relative z-[1] mx-auto">
          <Image
            src="/Mounis Logo.png"
            alt=""
            width={260}
            height={200}
            priority
            aria-hidden
            className="launch-logo-image mx-auto block h-auto w-40 object-contain object-top sm:w-48 md:w-52"
          />
        </div>
      </div>

      <div className="relative z-[1] mt-2 text-center sm:mt-3">
        <p className="font-[family-name:var(--font-script)] text-3xl text-[var(--color-cream)] sm:text-4xl md:text-[2.75rem]">
          {site.brandLine}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-5xl font-medium tracking-[0.06em] text-[var(--color-cream)] sm:mt-1.5 sm:text-6xl md:text-7xl">
          {site.brandName}
        </p>
      </div>

      <span className="sr-only">{site.name}</span>
    </div>
  );
}

export default function LaunchCelebration({ countdownSeconds }) {
  const router = useRouter();
  const [phase, setPhase] = useState(() =>
    countdownSeconds <= 0 ? "celebration" : "countdown",
  );
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [exiting, setExiting] = useState(false);
  const [curtainDone, setCurtainDone] = useState(countdownSeconds <= 0);
  const { minutes, seconds } = splitMinutesSeconds(secondsLeft);
  const progress =
    countdownSeconds > 0 ? (secondsLeft / countdownSeconds) * 100 : 0;
  const backdrop = heroImages[0]?.src ?? "/hero/h1.png";
  const isCelebrating = phase === "celebration";

  const goHome = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    try {
      sessionStorage.setItem(LAUNCH_TRANSITION_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    window.setTimeout(() => router.push("/"), LAUNCH_EXIT_DURATION_MS);
  }, [router, exiting]);

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setPhase("celebration");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!isCelebrating) return undefined;

    const curtainTimer = window.setTimeout(() => setCurtainDone(true), 1100);
    const redirectTimer = window.setTimeout(goHome, LAUNCH_REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(curtainTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [isCelebrating, goHome]);

  return (
    <div
      className={cn(
        "launch-scene relative min-h-[100dvh] overflow-hidden text-[var(--color-cream)]",
        isCelebrating && "launch-scene-live",
        exiting && "launch-scene-exiting",
      )}
    >
      <div className="absolute inset-0" aria-hidden>
        {isCelebrating ? (
          <>
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              className="launch-backdrop-photo object-cover"
              sizes="100vw"
            />
            <div className="launch-backdrop-overlay absolute inset-0" />
          </>
        ) : (
          <div className="launch-countdown-bg absolute inset-0" />
        )}
      </div>

      <LaunchGoldDust active={!exiting} intensity={1} />
      <ConfettiBurst active={isCelebrating && curtainDone && !exiting} />

      {exiting && (
        <>
          <div className="absolute inset-0 z-[45] flex items-center justify-center px-6">
            <LaunchTransitionEmblem
              className="launch-exit-emblem"
              subtitle="See you inside"
            />
          </div>
          <div className="launch-curtain launch-curtain-left launch-curtain-close-left" aria-hidden />
          <div className="launch-curtain launch-curtain-right launch-curtain-close-right" aria-hidden />
        </>
      )}

      {isCelebrating && !curtainDone && !exiting && (
        <>
          <div className="launch-curtain launch-curtain-left" aria-hidden />
          <div className="launch-curtain launch-curtain-right" aria-hidden />
        </>
      )}

      <div
        className={cn(
          "relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 sm:px-8",
          isCelebrating && curtainDone && "launch-content-revealed",
        )}
      >
        <div
          className={cn(
            "launch-scene-content flex w-full max-w-2xl flex-col items-center text-center transition-all duration-700",
            exiting && "launch-scene-content-exit",
            isCelebrating && curtainDone
              ? "scale-100 opacity-100"
              : isCelebrating
                ? "scale-95 opacity-0"
                : "scale-100 opacity-100",
          )}
        >
          <BrandLogo celebrating={isCelebrating} />

          {!isCelebrating ? (
            <div className="launch-fade-up launch-delay-1 mt-8 w-full sm:mt-10">
              <p className="font-[family-name:var(--font-script)] text-[1.75rem] text-[var(--color-gold)] sm:text-3xl">
                Grand Opening
              </p>
              <div className="mx-auto mt-3 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-[var(--color-cream)]/15 sm:w-14" />
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-cream)]/45 sm:text-xs">
                  Opening in
                </p>
                <span className="h-px w-10 bg-[var(--color-cream)]/15 sm:w-14" />
              </div>

              <div className="launch-fade-up launch-delay-2 mx-auto mt-8 flex max-w-md items-center justify-center gap-4 px-4 py-5 sm:mt-9 sm:gap-6 sm:px-6 sm:py-6 launch-countdown-bar">
                <FlipPair value={minutes} label="Minutes" index={0} />
                <span className="launch-colon mb-7 font-[family-name:var(--font-display)] text-4xl text-[var(--color-cream)]/35 sm:mb-8 sm:text-5xl">
                  :
                </span>
                <FlipPair value={seconds} label="Seconds" index={1} />
              </div>

              <CountdownProgress progress={progress} />

              <p className="launch-fade-up launch-delay-3 mx-auto mt-7 max-w-sm text-sm leading-relaxed text-[var(--color-cream)]/55 sm:mt-8">
                {site.tagline}
              </p>
            </div>
          ) : (
            <div className="launch-celebration-copy mt-6 sm:mt-8">
              <p className="launch-pop font-[family-name:var(--font-script)] text-4xl text-[var(--color-gold)] sm:text-5xl">
                We&apos;re Live
              </p>
              <h2 className="launch-pop launch-delay-1 mt-4 font-[family-name:var(--font-display)] text-3xl font-medium sm:text-5xl">
                The boutique is open
              </h2>
              <p className="launch-pop launch-delay-2 mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--color-cream)]/70 sm:text-base">
                Discover sarees, three-piece sets, dresses and kurtis — curated
                with timeless Indian elegance.
              </p>

              <button
                type="button"
                onClick={goHome}
                className="launch-pop launch-delay-3 launch-enter-btn group mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-10 text-sm font-semibold sm:mt-10 sm:min-h-[3.25rem] sm:px-12"
              >
                Enter the store
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              <div className="launch-pop launch-delay-4 mx-auto mt-6 flex items-center justify-center gap-2">
                <span className="launch-auto-dot" />
                <span className="launch-auto-dot launch-auto-dot-2" />
                <span className="launch-auto-dot launch-auto-dot-3" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
