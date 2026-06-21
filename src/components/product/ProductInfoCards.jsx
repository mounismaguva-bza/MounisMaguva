import {
  AlertTriangle,
  BadgeCheck,
  Clock,
  HeartHandshake,
  RotateCcw,
  Truck,
} from "lucide-react";
import { productInfoCards } from "@/lib/product-details";
import { cn } from "@/lib/utils";

const icons = {
  truck: Truck,
  clock: Clock,
  alert: AlertTriangle,
  return: RotateCcw,
  quality: BadgeCheck,
  satisfaction: HeartHandshake,
};

export default function ProductInfoCards() {
  return (
    <section className="mt-8 pt-2 lg:mt-10">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-primary)] sm:text-xl">
          Why shop with us
        </h3>
        <p className="text-xs text-[var(--color-muted)]">
          Trusted service on every order
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr sm:gap-4 lg:gap-4 xl:grid-cols-3 2xl:grid-cols-3 2xl:gap-5">
        {productInfoCards.map((card) => {
          const Icon = icons[card.icon];
          return (
            <li key={card.id} className="flex min-h-0">
              <article
                className={cn(
                  "flex h-full w-full gap-3.5 rounded-2xl border p-4 transition-shadow hover:shadow-md",
                  card.className,
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center self-start rounded-xl bg-white/90 shadow-sm ring-1 ring-black/[0.06]",
                    card.iconClassName,
                  )}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                  <p className="text-sm font-semibold leading-snug tracking-tight">
                    {card.title}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">{card.description}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
