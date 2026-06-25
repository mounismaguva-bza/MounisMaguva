/** Run work after paint — never blocks initial render. */
export function scheduleBackgroundTask(callback, { timeout = 4000 } = {}) {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 0);
  return () => window.clearTimeout(id);
}

/** Spread heavy work across idle slices so scrolling stays smooth. */
export function runInIdleBatches(items, processItem, { batchSize = 3 } = {}) {
  if (!items.length) return () => {};

  let index = 0;
  let cancelled = false;
  let idleId = 0;
  let timeoutId = 0;

  const step = (deadline) => {
    if (cancelled) return;

    const budget =
      typeof deadline?.timeRemaining === "function" ? deadline.timeRemaining() : 12;

    while (index < items.length && budget > 1) {
      const end = Math.min(index + batchSize, items.length);
      for (; index < end; index += 1) {
        processItem(items[index], index);
      }
    }

    if (index < items.length && !cancelled) {
      scheduleNext();
    }
  };

  const scheduleNext = () => {
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(step, { timeout: 5000 });
    } else {
      timeoutId = window.setTimeout(() => step({ timeRemaining: () => 10 }), 50);
    }
  };

  scheduleNext();

  return () => {
    cancelled = true;
    if (idleId && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
