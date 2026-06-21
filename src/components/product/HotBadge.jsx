import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HotBadge({ className, size = "default" }) {
  return (
    <span
      className={cn(
        "badge-hot inline-flex w-fit shrink-0 items-center gap-1 rounded-full font-extrabold uppercase text-white",
        "bg-gradient-to-br from-amber-300 via-orange-500 to-[var(--color-primary-dark)]",
        "ring-2 ring-white/90 shadow-[0_3px_14px_rgba(234,88,12,0.5)]",
        size === "sm"
          ? "px-2 py-0.5 text-[9px] tracking-[0.14em]"
          : "px-2.5 py-1 text-[10px] tracking-[0.12em]",
        className,
      )}
    >
      <Flame
        className={cn(
          "shrink-0 fill-amber-100 text-amber-50 drop-shadow-sm",
          size === "sm" ? "size-2.5" : "size-3",
        )}
        strokeWidth={2.5}
        aria-hidden
      />
      Hot
    </span>
  );
}
