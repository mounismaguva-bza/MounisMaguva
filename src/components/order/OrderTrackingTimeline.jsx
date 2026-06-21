import { cn } from "@/lib/utils";

export default function OrderTrackingTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <ol className="relative space-y-0">
      {timeline.map((step, index) => (
        <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
          {index < timeline.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5",
                step.state === "complete" || step.state === "current"
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-border)]",
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
              step.state === "complete" &&
                "border-[var(--color-primary)] bg-[var(--color-primary)] text-white",
              step.state === "current" &&
                "border-[var(--color-primary)] bg-white text-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/15",
              step.state === "upcoming" &&
                "border-[var(--color-border)] bg-white text-[var(--color-muted)]",
              step.state === "cancelled" &&
                "border-red-300 bg-red-50 text-red-600",
            )}
          >
            {step.state === "complete" ? "✓" : index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-sm font-semibold",
                step.state === "current"
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text)]",
              )}
            >
              {step.label}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
