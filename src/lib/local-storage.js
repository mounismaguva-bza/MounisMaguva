const isBrowser = typeof window !== "undefined";

export function readLocalJson(key, fallback = null) {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeLocalJson(key, value) {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readLocalStringSet(key) {
  const value = readLocalJson(key, []);
  return new Set(Array.isArray(value) ? value : []);
}

export function writeLocalStringSet(key, set) {
  writeLocalJson(key, [...set]);
}

export function removeLocalItem(key) {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
