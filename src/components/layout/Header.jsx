"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { IconInstagram } from "@/components/icons";
import { useCart } from "@/context/CartContext";
import { navLinks, site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] supports-[backdrop-filter]:lg:backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2 sm:max-w-[70%] sm:flex-initial sm:gap-2.5 lg:max-w-none">
            <Image
              src="/Mounis Logo.png"
              alt={site.name}
              width={72}
              height={72}
              className="h-11 w-11 shrink-0 rounded-full object-contain sm:h-14 sm:w-14"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="font-[family-name:var(--font-script)] text-base font-bold leading-none text-[var(--color-muted)] sm:text-lg">
                {site.brandLine}
              </span>
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-wide text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-primary-dark)] sm:text-2xl">
                {site.brandName}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[var(--color-primary)] ${
                  pathname === link.href
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              className="hidden rounded-full sm:inline-flex"
              render={
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on Instagram"
                />
              }
            >
              <IconInstagram className="size-4" />
            </Button>

            <Button
              type="button"
              variant="brand"
              size="icon-lg"
              className="relative touch-manipulation rounded-full"
              onClick={() => {
                setMobileOpen(false);
                openCart();
              }}
              aria-label={`Open cart, ${itemCount} items`}
            >
              <ShoppingBag className="size-4" />
              {itemCount > 0 && (
                <Badge
                  variant="gold"
                  className="absolute -top-1 -right-1 size-5 min-w-5 justify-center rounded-full p-0 text-[10px]"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </Badge>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="touch-manipulation rounded-full lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-[min(100%,320px)] flex-col border-[var(--color-border)] bg-[var(--color-cream)] p-0"
        >
          <SheetHeader className="border-b border-[var(--color-border)] px-6 py-5 text-left">
            <SheetTitle className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)]">
              Menu
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-[var(--color-border)]/50 px-2 py-3 text-lg font-medium ${
                  pathname === link.href ? "text-[var(--color-primary)]" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Separator className="mx-4" />
          <div className="mt-auto px-6 py-4">
            <Button
              variant="brandOutline"
              size="pill-sm"
              className="w-full"
              render={
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <IconInstagram className="size-4" />
              {site.instagramHandle}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

