/** Delay before redirecting to home after celebration (ms) */
export const LAUNCH_REDIRECT_DELAY_MS = 4800;

/** Default countdown length when env is not set (2 minutes) */
export const DEFAULT_LAUNCH_COUNTDOWN_SECONDS = 120;

/**
 * Countdown duration in seconds. Set in `.env.local`:
 * NEXT_PUBLIC_LAUNCH_COUNTDOWN_SECONDS=120
 */
export function getLaunchCountdownSeconds() {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_COUNTDOWN_SECONDS;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_LAUNCH_COUNTDOWN_SECONDS;
}
