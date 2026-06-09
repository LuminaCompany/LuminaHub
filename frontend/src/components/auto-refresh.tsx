"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the page fresh by issuing a soft refresh on a fixed interval.
 *
 * A soft refresh re-runs the route's server components and re-fetches their
 * data without a full page reload — client state, scroll position and open
 * dialogs are preserved. Combined with `revalidate: 2` on the data fetches,
 * this surfaces other users' changes within ~2s instead of only on F5.
 *
 * Polling pauses while the tab is hidden to avoid pointless background traffic.
 */
export function AutoRefresh({ intervalMs = 2000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer === null) {
        timer = setInterval(() => router.refresh(), intervalMs);
      }
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const sync = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [router, intervalMs]);

  return null;
}
