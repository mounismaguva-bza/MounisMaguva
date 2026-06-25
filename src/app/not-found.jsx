import Link from "next/link";
import { Home, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata = {
  title: "Page Not Found",
  description: `This page could not be found. Browse sarees, Frock and ethnic wear at ${site.name}.`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)]">
        <Sparkles className="size-3.5" />
        {site.brandName}
      </p>
      <p
        className="font-[family-name:var(--font-display)] text-8xl leading-none text-[var(--color-primary)]/15 sm:text-9xl"
        aria-hidden
      >
        404
      </p>
      <h1 className="section-title mt-2">Page not found</h1>
      <p className="section-subtitle mx-auto mt-4 max-w-md">
        The page you&apos;re looking for may have moved or no longer exists. Explore our
        collections instead.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="brand" size="pill" render={<Link href="/shop" />}>
          <Search className="size-4" />
          Shop all
        </Button>
        <Button variant="brandOutline" size="pill" render={<Link href="/collections" />}>
          Collections
        </Button>
        <Button variant="outline" size="pill" render={<Link href="/" />}>
          <Home className="size-4" />
          Back to home
        </Button>
      </div>
    </div>
  );
}
