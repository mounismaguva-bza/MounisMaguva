import { COLLECTIONS, listCollection } from "@/lib/firestore";
import { maguvaImage } from "@/lib/images";

const fallbackBanners = [
  {
    id: "fallback-home-offer",
    title: "Festive Offer",
    subtitle: "Up to 30% off on selected styles",
    imageUrl: maguvaImage(16),
    href: "/shop/new-arrivals",
    isActive: true,
    placement: "home",
    sortOrder: 1,
  },
];

export async function getActiveBanners(placement) {
  try {
    const banners = await listCollection(COLLECTIONS.banners, {
      orderBy: "sortOrder",
      direction: "asc",
    });
    const filtered = banners.filter((banner) => {
      if (!banner.isActive) return false;
      if (!placement) return true;
      return banner.placement === placement;
    });
    if (filtered.length) return filtered;
    return fallbackBanners.filter((banner) => banner.placement === placement);
  } catch {
    return fallbackBanners.filter((banner) => banner.placement === placement);
  }
}
