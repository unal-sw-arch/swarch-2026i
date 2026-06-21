'use client';

/**
 * Client island — Add to Wishlist button on the game detail page.
 * Lives in the game/[slug] folder so it co-locates with its parent server page.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Loader2, Check } from 'lucide-react';

import {
  addToWishlist,
  getSession,
  getWishlist,
  removeFromWishlist,
  type GameDetails,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  game: GameDetails;
}

type State = 'idle' | 'loading' | 'added' | 'unauthenticated' | 'error';

export function AddToWishlistButton({ game }: AddToWishlistButtonProps) {
  console.log('game.coverImage en el botón:', game.coverImage);
  const [state, setState] = useState<State>('loading');
  const [wishlistGameId, setWishlistGameId] = useState<string | null>(null);

  // On mount: validate the current session, then check if the game is already wishlisted.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) setState('unauthenticated');
          return;
        }

        const wishlist = await getWishlist();
        const existing = wishlist.games.find((g) => g.slug === game.slug);
        if (!cancelled) {
          if (existing) {
            setWishlistGameId(existing.id);
            setState('added');
          } else {
            setState('idle');
          }
        }
      } catch (err) {
        const apiErr = err as ApiError;
        if (!cancelled) {
          if (apiErr.status === 401 || apiErr.status === 403) {
            setState('unauthenticated');
          } else {
            setState('idle');
          }
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [game.slug]);

  const handleToggle = useCallback(async () => {
    if (state === 'unauthenticated') {
      window.location.href = '/auth/login';
      return;
    }

    if (state === 'added' && wishlistGameId) {
      setState('loading');
      try {
        await removeFromWishlist(wishlistGameId);
        setWishlistGameId(null);
        setState('idle');
      } catch {
        setState('added'); // revert
      }
      return;
    }

    if (state === 'idle') {
      setState('loading');
      try {
        // Find cheapest in-stock store for context
        const cheapest = [...game.stores]
          .filter((s) => s.inStock && s.price != null)
          .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0];

        const added = await addToWishlist({
          name: game.name,
          slug: game.slug,
          coverImage: game.coverImage,
          storeUrl: cheapest?.url ?? '',
          store: cheapest?.store ?? 'steam',
          priceAtAdd: cheapest?.price ?? undefined,
          currency: cheapest?.currency ?? 'USD',
        });
        setWishlistGameId(added.id);
        setState('added');
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 401 || apiErr.status === 403) {
          setState('unauthenticated');
        } else {
          setState('error');
          setTimeout(() => setState('idle'), 3000);
        }
      }
    }
  }, [state, wishlistGameId, game]);

  const label =
    state === 'unauthenticated'
      ? 'Sign in to Wishlist'
      : state === 'added'
        ? 'Wishlisted'
        : state === 'error'
          ? 'Error — Retry'
          : 'Add to Wishlist';

  return (
    <Button
      variant={state === 'added' ? 'tactical' : 'outline'}
      size="lg"
      onClick={handleToggle}
      disabled={state === 'loading'}
      aria-label={label}
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        state === 'added' && 'border-primary-container/50 text-primary-fixed-dim',
        state === 'error' && 'border-error/40 text-error',
      )}
    >
      {state === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === 'added' ? (
        <Check className="h-4 w-4" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
