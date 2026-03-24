"use client";

import { useEffect, useRef, useState } from "react";
import type { WishlistGame } from "@/lib/api";

export interface PriceUpdate {
  name: string;
  slug: string;
  store: string;
  price: number;
  originalPrice: number;
  currency: string;
  url: string;
}

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";

/**
 * Opens a Server-Sent Events connection to the gateway and returns the
 * latest price update for any game in `games`.
 *
 * The EventSource is opened once on mount and kept alive until the
 * component unmounts. Slug filtering is done via a ref so the socket
 * is not re-created when the wishlist changes after the initial render.
 *
 * @returns { latestUpdate, dismiss } — call dismiss() to clear the banner.
 */
export function usePriceUpdates(games: WishlistGame[]) {
  const [latestUpdate, setLatestUpdate] = useState<PriceUpdate | null>(null);
  // Use a ref for the slug set so the EventSource callback always sees the
  // latest wishlist without needing to be recreated.
  const slugsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    slugsRef.current = new Set(games.map((g) => g.slug));
  }, [games]);

  useEffect(() => {
    if (games.length === 0) return;

    const es = new EventSource(`${GATEWAY_URL}/api/events/stream`, {
      withCredentials: true,
    });

    es.addEventListener("price_update", (e: MessageEvent) => {
      try {
        const update = JSON.parse(e.data as string) as PriceUpdate;
        if (slugsRef.current.has(update.slug)) {
          setLatestUpdate(update);
        }
      } catch {
        /* ignore malformed events */
      }
    });

    // EventSource reconnects automatically on network errors; no action needed
    es.onerror = () => {};

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — open once on mount

  return {
    latestUpdate,
    dismiss: () => setLatestUpdate(null),
  };
}
