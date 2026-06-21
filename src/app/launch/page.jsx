import LaunchCelebration from "@/components/launch/LaunchCelebration";
import { getLaunchCountdownSeconds } from "@/lib/launch";
import { site } from "@/lib/site";

export const metadata = {
  title: "Grand Opening",
  description: `${site.name} is launching soon. Join us for the grand opening celebration.`,
  robots: { index: false, follow: false },
};

export default function LaunchPage() {
  return <LaunchCelebration countdownSeconds={getLaunchCountdownSeconds()} />;
}
