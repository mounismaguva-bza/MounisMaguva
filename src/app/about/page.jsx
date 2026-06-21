import Image from "next/image";
import Link from "next/link";
import { getImageByAlias } from "@/lib/media-overrides";
import { site } from "@/lib/site";

export const metadata = {
  title: "Our Story",
  description: `Learn about ${site.name} — premium ethnic wear for women.`,
};

export default async function AboutPage() {
  const editorialImage = await getImageByAlias("fashionImages.fashionEditorial");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
          <Image
            src={editorialImage}
            alt="Ethnic wear craftsmanship"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
        <div>
          <h1 className="section-title mb-6">Our Story</h1>
          <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
            <p>
              <strong className="text-[var(--color-text)]">{site.name}</strong> was born from a
              love of Indian textiles and the women who wear them with pride. We curate sarees,
              3 piece sets, and everyday ethnic pieces that balance tradition with modern style.
            </p>
            <p>
              Every design in our collection is selected for fabric feel, fit, and how it
              photographs — because we know you discover us on Instagram first and shop with
              confidence second.
            </p>
            <p>
              We don&apos;t use a traditional checkout. Instead, you add pieces to your bag and
              send your order on WhatsApp. We confirm availability, sizing, and payment personally
              — the way boutique shopping should feel.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop Now
            </Link>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              {site.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
