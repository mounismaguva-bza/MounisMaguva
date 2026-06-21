function stripBold(text) {
  return String(text || "").replace(/\*/g, "").trim();
}

/** @param {string} text */
export function parsePriceFromText(text) {
  const match = String(text || "").match(/[\d,]+(?:\.\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(/,/g, ""));
}

/** @param {string} line */
function extractSlugFromProductLine(line) {
  const viewMatch = line.match(/View product:\s*(\S+)/i);
  if (viewMatch) {
    const url = viewMatch[1];
    const slugMatch = url.match(/\/product\/([^/?#]+)/i);
    if (slugMatch) return slugMatch[1];
  }
  const pathMatch = line.match(/\/product\/([^/?#\s]+)/i);
  return pathMatch ? pathMatch[1] : "";
}

/**
 * Parse a customer WhatsApp order message (same format as buildWhatsAppOrderMessage).
 * @param {string} raw
 */
export function parseWhatsAppOrderMessage(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return {
      items: [],
      couponCode: "",
      discountAmount: null,
      total: null,
      note: "",
    };
  }

  const itemStarts = [];
  const itemRegex = /^(\d+)\.\s*(?:\*([^*]+)\*|(.+))\s*$/gm;
  let match;

  while ((match = itemRegex.exec(text)) !== null) {
    itemStarts.push({
      index: match.index,
      name: stripBold(match[2] || match[3] || ""),
    });
  }

  /** @type {Array<Record<string, unknown>>} */
  const items = [];

  itemStarts.forEach((start, index) => {
    const end = itemStarts[index + 1]?.index ?? text.length;
    const block = text.slice(start.index, end);

    const codeMatch = block.match(/^\s*Code:\s*(.+)$/im);
    const qtyMatch = block.match(/^\s*Qty:\s*(\d+)(?:\s*\|\s*Size:\s*(.+))?/im);
    const priceMatch = block.match(/^\s*Price:\s*(.+)$/im);

    let slug = "";
    block.split("\n").forEach((line) => {
      const fromLine = extractSlugFromProductLine(line);
      if (fromLine) slug = fromLine;
    });

    items.push({
      name: start.name,
      sku: codeMatch ? codeMatch[1].trim() : "",
      quantity: qtyMatch ? Number(qtyMatch[1]) || 1 : 1,
      size: qtyMatch?.[2]?.trim() || "",
      price: priceMatch ? parsePriceFromText(priceMatch[1]) : 0,
      slug,
    });
  });

  const couponCodeMatch =
    text.match(/^Coupon code:\s*(.+)$/im) || text.match(/Coupon \*([^*]+)\*/i);
  const discountMatch = text.match(/Coupon[^:\n]*:\s*-([^\n]+)/i);
  const totalMatch =
    text.match(/\*Estimated total:\s*([^*]+)\*/i) ||
    text.match(/^Estimated total:\s*(.+)$/im);
  const noteMatch = text.match(/^Note:\s*(.+)$/im);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const discountAmount = discountMatch ? parsePriceFromText(discountMatch[1]) : null;
  const parsedTotal = totalMatch ? parsePriceFromText(totalMatch[1]) : null;

  return {
    items,
    couponCode: couponCodeMatch ? stripBold(couponCodeMatch[1]) : "",
    discountAmount,
    total: parsedTotal ?? (discountAmount ? Math.max(0, subtotal - discountAmount) : subtotal),
    note: noteMatch ? noteMatch[1].trim() : "",
  };
}

/**
 * Match parsed lines to catalog products by SKU or slug.
 * @param {Array<Record<string, unknown>>} parsedItems
 * @param {Array<Record<string, unknown>>} products
 */
export function enrichOrderItemsFromCatalog(parsedItems, products) {
  const bySku = new Map(
    products
      .filter((product) => product.sku)
      .map((product) => [String(product.sku).trim().toUpperCase(), product]),
  );
  const bySlug = new Map(
    products
      .filter((product) => product.slug)
      .map((product) => [String(product.slug).trim().toLowerCase(), product]),
  );

  /** @type {string[]} */
  const warnings = [];

  const items = parsedItems.map((item) => {
    const skuKey = String(item.sku || "").trim().toUpperCase();
    const slugKey = String(item.slug || "").trim().toLowerCase();
    const product = bySku.get(skuKey) || bySlug.get(slugKey);

    if (product) {
      const image =
        (Array.isArray(product.images) && product.images[0]) ||
        (product.colorImages &&
          typeof product.colorImages === "object" &&
          Object.values(product.colorImages).flat()[0]) ||
        "";

      return {
        name: String(product.name || item.name),
        slug: String(product.slug || item.slug || ""),
        sku: String(product.sku || item.sku),
        price: Number(item.price) || Number(product.price) || 0,
        quantity: Number(item.quantity) || 1,
        size: String(item.size || ""),
        image: String(image || ""),
      };
    }

    if (item.name || item.sku) {
      warnings.push(
        `Not in catalog: ${item.name || "Unknown"}${item.sku ? ` (${item.sku})` : ""}`,
      );
    }

    return {
      name: String(item.name || ""),
      slug: String(item.slug || ""),
      sku: String(item.sku || ""),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: String(item.size || ""),
      image: "",
    };
  });

  return { items, warnings };
}
