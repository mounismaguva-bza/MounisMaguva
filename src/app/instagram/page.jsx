import Link from "next/link";
import InstagramFeed from "@/components/instagram/InstagramFeed";
import { IconInstagram } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getInstagramFeed } from "@/lib/instagram";
import { site } from "@/lib/site";

export const metadata = {
  title: "Instagram",
  description: `Latest posts and looks from ${site.name} on Instagram.`,
};

export default async function InstagramPage() {
  const { posts, source } = await getInstagramFeed(12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)]">
          <IconInstagram className="size-4" />
          {site.instagramHandle}
        </p>
        <h1 className="section-title">Instagram Feed</h1>
        <p className="section-subtitle mx-auto mt-3">
          New arrivals, styling reels, and customer looks — straight from our Instagram.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="brand" size="pill" render={<a href={site.instagram} target="_blank" rel="noopener noreferrer" />}>
            <IconInstagram className="size-4" />
            Follow on Instagram
          </Button>
          <Button variant="brandOutline" size="pill" render={<Link href="/shop" />}>
            Shop collection
          </Button>
        </div>
      </div>

      <InstagramFeed posts={posts} source={source} />

      {source === "api" && (
        <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
          Feed updates automatically every hour from Instagram.
        </p>
      )}

      {source === "none" && (
        <details className="mx-auto mt-10 max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-accent)] p-4 text-sm text-[var(--color-muted)]">
          <summary className="cursor-pointer font-semibold text-[var(--color-text)]">
            How to show live Instagram posts
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
            <li>
              Convert <strong>@maguva_ethinics</strong> to a Business or Creator account.
            </li>
            <li>
              Create a Meta app at{" "}
              <a
                href="https://developers.facebook.com/"
                className="text-[var(--color-primary)] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                developers.facebook.com
              </a>{" "}
              and add the Instagram API.
            </li>
            <li>
              Generate a long-lived access token, then add to{" "}
              <code className="text-xs">.env.local</code>:
              <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--color-surface)] p-3 text-xs">
{`INSTAGRAM_ACCESS_TOKEN=your_token_here
# Optional if "me/media" does not work:
INSTAGRAM_USER_ID=your_instagram_user_id`}
              </pre>
            </li>
            <li>Restart <code className="text-xs">npm run dev</code>.</li>
          </ol>
          <p className="mt-3">
            <strong>No API?</strong> Copy post links into{" "}
            <code className="text-xs">src/lib/instagram-posts.js</code> instead.
          </p>
        </details>
      )}
    </div>
  );
}
