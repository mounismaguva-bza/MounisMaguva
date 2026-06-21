import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { categories, navLinks, site } from "@/lib/site";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { IconInstagram, IconWhatsApp } from "@/components/icons";
import { Button } from "@/components/ui/button";

function FooterHeading({ children, className = "" }) {
  return (
    <h3
      className={`mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)] sm:mb-5 ${className}`}
    >
      <span className="h-px w-6 bg-[var(--color-gold)]/50" aria-hidden />
      {children}
    </h3>
  );
}

function FooterLink({ href, children, external }) {
  const className =
    "group inline-flex min-h-10 items-center gap-1 py-1 text-sm text-[var(--color-cream)]/80 transition-colors hover:text-[var(--color-gold)]";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <ChevronRight className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
      <ChevronRight className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
    </Link>
  );
}

export default function Footer() {
  const whatsappUrl = getWhatsAppChatUrl();

  return (
    <footer className="relative mt-auto overflow-hidden bg-[var(--color-primary)] text-[var(--color-cream)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] sm:opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/40 to-transparent" />

      <div className="relative border-b border-white/10 bg-black/15">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 lg:px-8">
          <p className="text-center text-sm leading-relaxed text-[var(--color-cream)]/90 sm:max-w-md sm:text-left">
            <span className="font-semibold text-[var(--color-gold)]">Shop on WhatsApp</span>
            {" — "}
            We confirm orders & sizing in minutes.
          </p>
          <Button
            variant="whatsapp"
            size="pill-sm"
            className="w-full justify-center sm:w-auto"
            render={<a href={whatsappUrl} rel="noopener noreferrer" />}
          >
            <IconWhatsApp className="size-4" />
            Chat now
          </Button>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-5">
            <Link
              href="/"
              className="group inline-flex flex-row items-center gap-3 sm:items-center"
            >
              <Image
                src="/Mounis Logo.png"
                alt={site.name}
                width={96}
                height={96}
                className="size-16 shrink-0 rounded-full object-contain ring-2 ring-white/15 transition-transform group-hover:scale-105 sm:size-20"
              />
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-cream)]/60">
                  {site.brandLine}
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-cream)] sm:text-3xl">
                  {site.brandName}
                </p>
              </div>
            </Link>
            <p className="mt-3 text-left text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]/90 sm:mt-2">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-md text-left text-sm leading-relaxed text-[var(--color-cream)]/75 sm:max-w-sm">
              {site.description}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:border-white/30 hover:bg-white/15"
              >
                <IconInstagram className="size-4 shrink-0" />
                <span className="truncate">{site.instagramHandle}</span>
              </a>
              <Link
                href="/instagram"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-[var(--color-cream)]/90 transition-colors hover:bg-white/10 hover:text-[var(--color-gold)]"
              >
                View feed
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:col-span-2 sm:grid-cols-2 lg:col-span-4">
            <div>
              <FooterHeading className="justify-center sm:justify-start">Shop</FooterHeading>
              <ul className="space-y-1 sm:space-y-2">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.slug}>
                    <FooterLink href={`/shop/${cat.slug}`}>{cat.name}</FooterLink>
                  </li>
                ))}
                <li>
                  <FooterLink href="/shop">View all products</FooterLink>
                </li>
                <li>
                  <FooterLink href="/collections">Collections</FooterLink>
                </li>
              </ul>
            </div>

            <div>
              <FooterHeading className="justify-center sm:justify-start">Explore</FooterHeading>
              <ul className="space-y-1 sm:space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <FooterHeading className="justify-center sm:justify-start">Visit us</FooterHeading>
            <ul className="space-y-3 text-sm sm:space-y-4">
              <li className="flex gap-3 text-[var(--color-cream)]/80">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--color-gold)]" />
                <span className="leading-relaxed">{site.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="flex min-h-10 items-center gap-3 text-[var(--color-cream)]/80 transition-colors hover:text-[var(--color-gold)]"
                >
                  <Phone className="size-4 shrink-0 text-[var(--color-gold)]" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex min-h-10 items-center gap-3 break-all text-[var(--color-cream)]/80 transition-colors hover:text-[var(--color-gold)]"
                >
                  <Mail className="size-4 shrink-0 text-[var(--color-gold)]" />
                  {site.email}
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)] hover:underline sm:mt-5 sm:justify-start"
            >
              Directions & map
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-12 sm:justify-start lg:mt-14">
          {["Free shipping", "100% quality", "WhatsApp orders", "Vijayawada store"].map(
            (badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-cream)]/70"
              >
                {badge}
              </span>
            ),
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--color-cream)]/50 sm:mt-8 sm:flex-row sm:gap-4 sm:pt-8">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="max-w-xs text-center leading-relaxed sm:max-w-none sm:text-right">
            Orders via WhatsApp · Pan-India shipping · Benz Circle, Vijayawada
          </p>
        </div>
      </div>
    </footer>
  );
}
