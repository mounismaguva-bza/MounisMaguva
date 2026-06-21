/**
 * @typedef {Object} ColorOption
 * @property {string} id
 * @property {string} label
 * @property {string} abbr
 * @property {string} hex
 * @property {boolean} available
 */

/**
 * @param {import('./products').Product} product
 * @returns {ColorOption[]}
 */
export function getColorOptions(product) {
  if (product.colorOptions?.length) {
    return product.colorOptions;
  }
  if (product.colors?.length) {
    return product.colors.map((label, index) => {
      const colorLabel = String(label).trim();
      const abbr = colorLabel
        .split(/[\s/&]+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();
      return {
        id: `color-${index}`,
        label: colorLabel,
        abbr: abbr || "CLR",
        hex: "#801818",
        available: product.inStock !== false,
      };
    });
  }
  const colorLabel = product.color?.trim() || "Standard";
  const abbr = colorLabel
    .split(/[\s/&]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return [
    {
      id: "default",
      label: colorLabel,
      abbr: abbr || "STD",
      hex: "#801818",
      available: product.inStock,
    },
  ];
}

/**
 * @param {import('./products').Product} product
 * @param {number} colorCount
 */
export function getProductBullets(product, colorCount) {
  const bullets = [
    {
      label: "About",
      value: product.description,
    },
    ...(product.fabric
      ? [
          {
            label: "Fabric",
            value: product.fabric,
          },
        ]
      : []),
    {
      label: "Blouse",
      value: product.blouse ?? "Matching blouse piece included (where applicable)",
    },
    {
      label: "Size support",
      value: product.sizes.join(" · "),
    },
    {
      label: "Total colors",
      value: `${colorCount} shade${colorCount > 1 ? "s" : ""} available`,
    },
  ];
  return bullets;
}

export const productInfoCards = [
  {
    id: "shipping",
    title: "Free Shipping",
    description: "On all orders across India",
    icon: "truck",
    className:
      "border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white text-emerald-950",
    iconClassName: "text-emerald-600",
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Dispatched in 3–5 business days",
    icon: "clock",
    className: "border-sky-200/70 bg-gradient-to-br from-sky-50 to-white text-sky-950",
    iconClassName: "text-sky-600",
  },
  {
    id: "color",
    title: "Color note",
    description: "Slight shade variation possible in natural light",
    icon: "alert",
    className:
      "border-amber-200/70 bg-gradient-to-br from-amber-50 to-white text-amber-950",
    iconClassName: "text-amber-600",
  },
  {
    id: "returns",
    title: "Return policy",
    description: "Easy exchanges within 7 days",
    icon: "return",
    className:
      "border-violet-200/70 bg-gradient-to-br from-violet-50 to-white text-violet-950",
    iconClassName: "text-violet-600",
  },
  {
    id: "quality",
    title: "100% Product Quality",
    description: "Handpicked fabrics and careful quality checks on every piece",
    icon: "quality",
    className:
      "border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-cream)] to-white text-[var(--color-text)]",
    iconClassName: "text-[var(--color-primary)]",
  },
  {
    id: "satisfaction",
    title: "100% Customer Satisfaction",
    description: "We stand behind every order — reach us anytime on WhatsApp",
    icon: "satisfaction",
    className:
      "border-teal-200/70 bg-gradient-to-br from-teal-50 to-white text-teal-950",
    iconClassName: "text-teal-600",
  },
];
