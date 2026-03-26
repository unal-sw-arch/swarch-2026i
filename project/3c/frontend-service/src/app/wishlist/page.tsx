'use client';

/**
 * Wishlist page — client component.
 *
 * Protected: redirects to /auth/login if the user is not authenticated.
 * Fetches the user's wishlist on mount and allows removing games.
 */

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Trash2,
  ExternalLink,
  Loader2,
  PackageOpen,
  AlertTriangle,
  TrendingDown,
  X,
} from 'lucide-react';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { formatPrice, storeLabel } from '@/lib/utils';

import {
  getSession,
  getWishlist,
  removeFromWishlist,
  type AuthUser,
  type WishlistGame,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function WishlistSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl p-4 bg-surface-container ghost-border">
          <Skeleton className="h-16 w-12 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-20 w-20 rounded-2xl bg-surface-container-high flex items-center justify-center">
        <PackageOpen className="h-9 w-9 text-on-surface-variant/40" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        Your wishlist is empty
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs mb-6">
        Browse games and click &quot;Add to Wishlist&quot; to save them here for easy price tracking.
      </p>
      <Button asChild>
        <Link href="/search?q=">Discover Games</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function WishlistError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-16 w-16 rounded-2xl bg-error-container/15 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        Failed to load wishlist
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wishlist game row
// ---------------------------------------------------------------------------

interface WishlistRowProps {
  game: WishlistGame;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}

function WishlistRow({ game, onRemove, isRemoving }: WishlistRowProps) {
  const addedDate = new Date(game.addedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-xl p-4 transition-all duration-150',
        'bg-surface-container ghost-border hover:bg-surface-container-high',
        isRemoving && 'opacity-50 pointer-events-none',
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-surface-container-low">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={`${game.name} cover`}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-headline text-lg font-bold text-on-surface-variant/30 select-none">
              {game.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/game/${game.slug}`}
          className="font-headline text-sm font-semibold text-on-surface hover:text-primary-fixed-dim transition-colors truncate block"
        >
          {game.name}
        </Link>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {storeLabel(game.store)}
          </Badge>
          <span className="text-[10px] text-on-surface-variant">
            Added {addedDate}
          </span>
        </div>
        {game.priceAtAdd != null && (
          <p className="text-xs text-on-surface-variant mt-0.5">
            Price when added:{' '}
            <span className="text-on-surface font-medium">
              {formatPrice(game.priceAtAdd, game.currency)}
            </span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {game.storeUrl && game.storeUrl !== '#' && (
          <Button variant="tactical" size="sm" asChild>
            <Link
              href={game.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(game.id)}
          disabled={isRemoving}
          aria-label={`Remove ${game.name} from wishlist`}
          className="text-on-surface-variant hover:text-error hover:bg-error-container/15 transition-colors"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function WishlistPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [games, setGames] = useState<WishlistGame[]>([]);
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const { latestUpdate, dismiss } = usePriceUpdates(games);

  useEffect(() => {
    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          router.replace('/auth/login');
          return;
        }

        setUser(session.user);
        const wishlist = await getWishlist();
        setGames(wishlist.games);
        setPageState('ready');
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 401 || apiErr.status === 403) {
          router.replace('/auth/login');
        } else {
          setErrorMessage('Could not load your wishlist. Please try again.');
          setPageState('error');
        }
      }
    }

    load();
  }, [router]);

  const handleRemove = useCallback(async (gameId: string) => {
    setRemovingIds((prev) => new Set(prev).add(gameId));
    try {
      await removeFromWishlist(gameId);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch {
      // Silently revert — game stays in list
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="h-5 w-5 text-primary-container" aria-hidden="true" />
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            My Wishlist
          </h1>
        </div>
        {user && (
          <p className="text-sm text-on-surface-variant">
            Signed in as{' '}
            <span className="text-on-surface font-medium">{user.name}</span>
          </p>
        )}
        <div className="h-px bg-gradient-to-r from-primary-container/30 to-transparent mt-3" />
      </div>

      {/* Price drop notification banner */}
      {latestUpdate && (
        <div className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 bg-surface-container ghost-border border-primary-container/30">
          <TrendingDown className="h-4 w-4 text-primary-container shrink-0" aria-hidden="true" />
          <p className="flex-1 text-sm text-on-surface">
            <span className="font-semibold">{latestUpdate.name}</span>
            {' '}is now{' '}
            <span className="font-semibold text-primary-container">
              {formatPrice(latestUpdate.price, latestUpdate.currency)}
            </span>
            {' '}on {storeLabel(latestUpdate.store)}
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* States */}
      {pageState === 'loading' && <WishlistSkeleton />}

      {pageState === 'error' && <WishlistError message={errorMessage} />}

      {pageState === 'ready' && games.length === 0 && <EmptyWishlist />}

      {pageState === 'ready' && games.length > 0 && (
        <>
          {/* Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">{games.length}</span>{' '}
              {games.length === 1 ? 'game' : 'games'} saved
            </p>
            {/* TODO: Add sort/filter controls */}
          </div>

          {/* Game list */}
          <div className="space-y-2">
            {games.map((game, idx) => (
              <React.Fragment key={game.id}>
                <WishlistRow
                  game={game}
                  onRemove={handleRemove}
                  isRemoving={removingIds.has(game.id)}
                />
                {idx < games.length - 1 && (
                  <Separator className="opacity-0" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Discover more */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              Looking for more deals?
            </p>
            <Button variant="tactical" asChild>
              <Link href="/search?q=">Browse Games</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
