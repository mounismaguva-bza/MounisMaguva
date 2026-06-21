import { ExternalLink, Play } from "lucide-react";
import { IconInstagram } from "@/components/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   posts: import('@/lib/instagram').InstagramPost[];
 *   source: 'api' | 'curated' | 'none';
 * }} props
 */
export default function InstagramFeed({ posts, source }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
        <IconInstagram className="mx-auto mb-4 size-12 text-[var(--color-primary)]" />
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-text)]">
          Connect your Instagram feed
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
          Add an Instagram API token in <code className="text-xs">.env.local</code> for
          automatic posts, or list post links in{" "}
          <code className="text-xs">src/lib/instagram-posts.js</code>.
        </p>
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
        >
          <IconInstagram className="size-4" />
          View {site.instagramHandle} on Instagram
        </a>
      </div>
    );
  }

  return (
    <>
      {source === "curated" && (
        <p className="mb-4 text-center text-xs text-[var(--color-muted)]">
          Curated highlights — add more posts in{" "}
          <code className="rounded bg-[var(--color-surface)] px-1">instagram-posts.js</code>{" "}
          or connect the API for auto-sync.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] transition-all hover:ring-[var(--color-primary)]"
          >
            {/* Native img: Instagram CDN hostnames vary by region */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.mediaUrl}
              alt={post.caption || "Instagram post"}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35",
              )}
            >
              <ExternalLink className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            {post.mediaType === "VIDEO" && (
              <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/55 text-white">
                <Play className="size-4 fill-white" />
              </span>
            )}
            {post.caption && (
              <p className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/75 to-transparent p-3 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {post.caption}
              </p>
            )}
          </a>
        ))}
      </div>
    </>
  );
}
