import Image from "next/image";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function LaunchTransitionEmblem({ className, subtitle = "Welcome" }) {
  return (
    <div
      className={cn(
        "launch-transition-emblem flex flex-col items-center text-center",
        className,
      )}
    >
      <div className="launch-logo-emblem relative mx-auto">
        <Image
          src="/Mounis Logo.png"
          alt=""
          width={200}
          height={160}
          priority
          aria-hidden
          className="launch-logo-image mx-auto block h-auto w-28 object-contain object-top sm:w-32"
        />
      </div>
      <p className="mt-2 font-[family-name:var(--font-script)] text-2xl text-[var(--color-gold)] sm:text-3xl">
        {subtitle}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-medium tracking-[0.08em] text-[var(--color-cream)] sm:text-2xl">
        {site.brandName}
      </p>
      <span className="launch-transition-line mt-3" aria-hidden />
    </div>
  );
}
