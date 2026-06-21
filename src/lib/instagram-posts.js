import { maguvaImage } from "./images";

/**
 * Manual Instagram posts (fallback when API token is not set).
 *
 * How to add a post:
 * 1. Open the post on Instagram → ⋯ → Copy link
 * 2. Paste permalink below
 * 3. Set imageUrl to a Maguva image path or another shop image
 *
 * @typedef {Object} CuratedPost
 * @property {string} id
 * @property {string} permalink Full post URL
 * @property {string} imageUrl Image shown in the grid
 * @property {string} [caption]
 */

/** @type {CuratedPost[]} */
export const curatedInstagramPosts = [
  {
    id: "post-1",
    permalink: "https://www.instagram.com/maguva_ethinics/",
    imageUrl: maguvaImage(23),
    caption: "New saree collection",
  },
  {
    id: "post-2",
    permalink: "https://www.instagram.com/maguva_ethinics/",
    imageUrl: maguvaImage(24),
    caption: "Festive lehenga looks",
  },
  {
    id: "post-3",
    permalink: "https://www.instagram.com/maguva_ethinics/",
    imageUrl: maguvaImage(25),
    caption: "Kurti & daily wear",
  },
  {
    id: "post-4",
    permalink: "https://www.instagram.com/maguva_ethinics/",
    imageUrl: maguvaImage(26),
    caption: "Bridal edit",
  },
  {
    id: "post-5",
    permalink: "https://www.instagram.com/maguva_ethinics/",
    imageUrl: maguvaImage(27),
    caption: "Studio highlights",
  },
];
