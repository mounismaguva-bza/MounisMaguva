import { curatedInstagramPosts } from "./instagram-posts";

const MEDIA_FIELDS =
  "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";

/**
 * @typedef {Object} InstagramPost
 * @property {string} id
 * @property {string} permalink
 * @property {string} mediaUrl
 * @property {'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'curated'} mediaType
 * @property {string} [caption]
 */

/**
 * Fetches latest posts from Instagram Graph API when INSTAGRAM_ACCESS_TOKEN is set.
 * @returns {Promise<InstagramPost[] | null>} null = no token or API error
 */
export async function fetchInstagramFeed(limit = 12) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const base = userId
    ? `https://graph.instagram.com/${userId}/media`
    : "https://graph.instagram.com/me/media";

  try {
    const url = new URL(base);
    url.searchParams.set("fields", MEDIA_FIELDS);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("[instagram] API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const items = json.data ?? [];

    return items
      .map((item) => normalizeGraphItem(item))
      .filter((item) => item.mediaUrl);
  } catch (err) {
    console.error("[instagram] fetch failed:", err);
    return null;
  }
}

/**
 * @param {import('./instagram-posts').CuratedPost} post
 * @returns {InstagramPost}
 */
function normalizeCurated(post) {
  return {
    id: post.id,
    permalink: post.permalink,
    mediaUrl: post.imageUrl,
    mediaType: "curated",
    caption: post.caption,
  };
}

/**
 * @param {Record<string, unknown>} item
 * @returns {InstagramPost}
 */
function normalizeGraphItem(item) {
  const mediaType = /** @type {string} */ (item.media_type);
  const mediaUrl =
    mediaType === "VIDEO"
      ? /** @type {string} */ (item.thumbnail_url)
      : /** @type {string} */ (item.media_url);

  return {
    id: /** @type {string} */ (item.id),
    permalink: /** @type {string} */ (item.permalink),
    mediaUrl,
    mediaType: /** @type {InstagramPost['mediaType']} */ (mediaType),
    caption:
      typeof item.caption === "string"
        ? item.caption.slice(0, 150)
        : undefined,
  };
}

/**
 * Live API feed, or manually curated posts from instagram-posts.js
 * @returns {Promise<{ posts: InstagramPost[]; source: 'api' | 'curated' | 'none' }>}
 */
export async function getInstagramFeed(limit = 12) {
  const apiPosts = await fetchInstagramFeed(limit);
  if (apiPosts?.length) {
    return { posts: apiPosts.slice(0, limit), source: "api" };
  }

  if (curatedInstagramPosts.length) {
    return {
      posts: curatedInstagramPosts.map(normalizeCurated).slice(0, limit),
      source: "curated",
    };
  }

  return { posts: [], source: "none" };
}
