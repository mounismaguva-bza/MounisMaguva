import Link from "next/link";
import { site } from "@/lib/site";
import { IconInstagram } from "@/components/icons";

export default function InstagramBanner() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] px-6 py-12 sm:px-12 sm:py-16 text-center text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative z-10 max-w-xl mx-auto">
            <IconInstagram className="w-10 h-10 mx-auto mb-4 opacity-90" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl mb-3">
              Follow our journey
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed">
              See new arrivals, styling tips & customer looks on Instagram. Our collection
              comes alive on {site.instagramHandle}.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/instagram"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-text)]"
              >
                <IconInstagram />
                View feed
              </Link>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Follow {site.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
