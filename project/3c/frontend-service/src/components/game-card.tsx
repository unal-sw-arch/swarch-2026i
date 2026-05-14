import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, TrendingDown } from 'lucide-react';

import { type GameSummary } from '@/lib/api';
import { cn, formatPrice, toSlug, discountPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GameCardProps {
  game: GameSummary;
  linkable?: boolean;
  className?: string;
  variant?: 'grid' | 'list';
}

// ---------------------------------------------------------------------------
// Store badge — brand-tinted pill
// ---------------------------------------------------------------------------

function StoreBadge({ store }: { store: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    steam:     { bg: 'rgba(74,141,202,0.12)',  color: '#4a8dca', label: 'Steam' },
    epic:      { bg: 'rgba(255,255,255,0.08)', color: '#c8c8c8', label: 'Epic' },
    gog:       { bg: 'rgba(185,95,225,0.12)',  color: '#b95fe1', label: 'GOG' },
    microsoft: { bg: 'rgba(95,186,95,0.12)',   color: '#5fba5f', label: 'Xbox' },
  };

  const key = store.toLowerCase();
  const s = styles[key] ?? { bg: 'rgba(255,255,255,0.06)', color: '#c4a8a5', label: store };

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold font-headline"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Price section
// ---------------------------------------------------------------------------

interface PriceSectionProps {
  game: GameSummary;
}

function PriceSection({ game }: PriceSectionProps) {
  const cheapest = game.stores.reduce<(typeof game.stores)[0] | null>(
    (acc, s) => {
      if (s.price == null) return acc;
      if (acc == null || s.price < (acc.price ?? Infinity)) return s;
      return acc;
    },
    null,
  );

  if (!cheapest) {
    return <span className="text-xs text-on-surface-variant font-body">No price data</span>;
  }

  const discount =
    cheapest.originalPrice != null
      ? discountPercent(cheapest.originalPrice, cheapest.price ?? 0)
      : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-headline font-semibold text-primary-container text-base">
        {formatPrice(cheapest.price, cheapest.currency)}
      </span>

      {cheapest.originalPrice != null && cheapest.originalPrice !== cheapest.price && (
        <span className="text-xs text-on-surface-variant/50 line-through font-body">
          {formatPrice(cheapest.originalPrice, cheapest.currency)}
        </span>
      )}

      {discount != null && discount > 0 && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold font-headline"
          style={{ background: 'rgba(93,184,150,0.15)', color: '#7ecfb1' }}
        >
          <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
          -{discount}%
        </span>
      )}

      <StoreBadge store={cheapest.store} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid variant — "Game Case" physical feel
// ---------------------------------------------------------------------------

function GameCardGrid({ game, linkable = true, className }: Omit<GameCardProps, 'variant'>) {
  const slug = game.slug ?? toSlug(game.name);
  const storeCount = game.stores.filter((s) => s.price != null).length;

  const inner = (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-surface-container-low',
        'transition-all duration-300',
        'hover:bg-surface-container-highest hover:shadow-card-hover hover:scale-[1.02]',
        className,
      )}
    >
      {/* Cover image — 3:4 aspect ratio like a game case */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-surface-container">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={`${game.name} cover`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder — initials on warm gradient */
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #221816 0%, #2e2220 100%)' }}
          >
            <span className="font-headline text-4xl font-bold select-none"
              style={{ color: 'rgba(255,154,93,0.20)' }}
            >
              {game.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Store count badge */}
        {storeCount > 1 && (
          <div className="absolute bottom-2 right-2 glass rounded-full px-2 py-0.5">
            <span className="text-[10px] font-semibold font-headline text-on-surface-variant/70">
              {storeCount} stores
            </span>
          </div>
        )}

        {/* Warm hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(255,154,93,0.10) 0%, transparent 60%)' }}
          aria-hidden="true"
        />
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-headline text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
          {game.name}
        </h3>
        <PriceSection game={game} />
      </div>
    </div>
  );

  if (!linkable) return inner;

  return (
    <Link
      href={`/game/${slug}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/40 rounded-2xl block"
    >
      {inner}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// List variant
// ---------------------------------------------------------------------------

function GameCardList({ game, linkable = true, className }: Omit<GameCardProps, 'variant'>) {
  const slug = game.slug ?? toSlug(game.name);

  const inner = (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-2xl p-3',
        'bg-surface-container-low',
        'transition-all duration-200 hover:bg-surface-container-high hover:shadow-ambient',
        className,
      )}
    >
      {/* Thumbnail */}
      <div
        className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl"
        style={{ background: 'linear-gradient(160deg, #221816 0%, #2e2220 100%)' }}
      >
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
            <span className="font-headline text-lg font-bold" style={{ color: 'rgba(255,154,93,0.25)' }}>
              {game.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-headline text-sm font-semibold text-on-surface truncate">
          {game.name}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          {game.stores.slice(0, 3).map((s) => (
            <StoreBadge key={s.store} store={s.store} />
          ))}
          {game.stores.length > 3 && (
            <span className="text-[10px] text-on-surface-variant/50 font-body">
              +{game.stores.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <PriceSection game={game} />
      </div>

      {/* Arrow */}
      <ExternalLink className="h-4 w-4 shrink-0 text-on-surface-variant/20 group-hover:text-primary-container/60 transition-colors" />
    </div>
  );

  if (!linkable) return inner;

  return (
    <Link
      href={`/game/${slug}`}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/40 rounded-2xl block"
    >
      {inner}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export function GameCard({ variant = 'grid', ...props }: GameCardProps) {
  if (variant === 'list') return <GameCardList {...props} />;
  return <GameCardGrid {...props} />;
}
