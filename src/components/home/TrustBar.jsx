import { IconShield, IconTruck, IconWhatsApp } from "@/components/icons";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const items = [
  {
    icon: IconTruck,
    title: "Free Shipping",
    text: "On all orders across India",
    iconClassName:
      "bg-emerald-50 text-emerald-700 ring-emerald-200/70 group-hover:bg-emerald-100/80",
  },
  {
    icon: IconShield,
    title: "Authentic Quality",
    text: "Handpicked fabrics & craftsmanship",
    iconClassName:
      "bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-[var(--color-primary)]/15 group-hover:bg-[var(--color-primary)]/15",
  },
  {
    icon: IconWhatsApp,
    title: "WhatsApp Orders",
    text: "Easy checkout & personal support",
    href: getWhatsAppChatUrl(),
    iconClassName:
      "bg-[#25D366]/10 text-[#128C7E] ring-[#25D366]/25 group-hover:bg-[#25D366]/15",
  },
];

function TrustItem({ icon: Icon, title, text, href, iconClassName }) {
  const content = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-300 group-hover:scale-105 sm:size-12",
          iconClassName,
        )}
      >
        <Icon className="size-[18px] sm:size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-[family-name:var(--font-display)] text-[11px] font-semibold leading-tight text-[var(--color-text)] sm:text-sm">
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--color-muted)] sm:mt-1 sm:text-xs">
          {text}
        </p>
      </div>
    </>
  );

  const className = cn(
    "group flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-2.5 transition-all duration-300 sm:gap-4 sm:px-4 sm:py-4",
    "sm:border-[var(--color-border)]/60 sm:bg-white/45 sm:backdrop-blur-sm",
    "sm:hover:-translate-y-0.5 sm:hover:border-[var(--color-primary)]/15 sm:hover:bg-white/75 sm:hover:shadow-md",
    href && "sm:cursor-pointer",
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${title} — ${text}`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function TrustBar() {
  return (
    <section
      aria-label="Why shop with us"
      className="relative overflow-hidden border-y border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-cream)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-5">
          {items.map((item) => (
            <TrustItem key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
