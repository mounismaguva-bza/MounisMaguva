import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionCategoryCard({
  href,
  name,
  description,
  image,
  count,
  className,
  size = "default",
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[var(--color-surface)]",
        size === "large" && "min-h-[280px] md:min-h-full",
        size === "medium" && "min-h-[200px]",
        size === "default" && "min-h-[180px] aspect-[4/5] md:aspect-auto",
        className,
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes={
          size === "large"
            ? "(max-width: 768px) 100vw, 50vw"
            : "(max-width: 768px) 50vw, 25vw"
        }
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 transition-opacity group-hover:from-black/85" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <div className="mb-auto flex justify-end">
          <span className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-[var(--color-primary)]">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {count}+ styles
        </p>
        <h2
          className={cn(
            "font-[family-name:var(--font-display)] text-white leading-tight",
            size === "large" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {name}
        </h2>
        <p className="mt-1 max-w-xs text-sm text-white/80">{description}</p>
        <span className="mt-3 inline-flex text-xs font-semibold text-white/90 underline-offset-4 group-hover:underline">
          Explore collection
        </span>
      </div>
    </Link>
  );
}
