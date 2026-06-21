const SPEC_LABEL_PATTERN =
  /(?:^|\s)((?:Print\/Design Work|Fabric|Design|Border|Occasion|Style|Care(?:\s+instructions)?|Length|Work|Blouse(?:\s+piece)?|Color|Weave|Pattern))\s*:\s*/gi;

/**
 * Split a product description into intro prose and label:value specs.
 * @param {string} [description]
 */
export function parseProductDescription(description) {
  if (!description?.trim()) {
    return { intro: "", specs: [] };
  }

  const text = description.trim();
  const lineSpecs = [];
  const introLines = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length > 1) {
    for (const line of lines) {
      const match = line.match(/^([^:]{2,48}):\s*(.+)$/);
      if (match) {
        lineSpecs.push({ label: match[1].trim(), value: match[2].trim() });
      } else {
        introLines.push(line);
      }
    }

    if (lineSpecs.length > 0) {
      return { intro: introLines.join("\n\n"), specs: lineSpecs };
    }
  }

  const matches = [...text.matchAll(SPEC_LABEL_PATTERN)];
  if (!matches.length) {
    return { intro: text, specs: [] };
  }

  const intro = text.slice(0, matches[0].index).trim();
  const specs = matches.map((match, index) => {
    const label = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const value = text.slice(start, end).trim().replace(/\s+/g, " ");
    return { label, value };
  });

  return { intro, specs };
}

/**
 * @param {Array<{ label: string, value: string }>} specs
 */
export function dedupeSpecs(specs) {
  const seen = new Set();
  return specs.filter((item) => {
    const key = item.label.toLowerCase();
    if (!item.value?.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
