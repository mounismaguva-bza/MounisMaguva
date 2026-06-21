/** Delay before redirecting to home after celebration (ms) */
export const LAUNCH_REDIRECT_DELAY_MS = 4800;

/** Exit curtain animation before navigating home (ms) */
export const LAUNCH_EXIT_DURATION_MS = 1150;

/** Home curtain reveal after arriving from launch (ms) */
export const LAUNCH_HOME_REVEAL_MS = 1300;

/** sessionStorage key set when leaving /launch for / */
export const LAUNCH_TRANSITION_KEY = "mm-from-launch";

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
