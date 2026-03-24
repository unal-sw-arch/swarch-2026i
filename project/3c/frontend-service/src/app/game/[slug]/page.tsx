/**
 * Game detail page — server component.
 *
 * Cinematic header with blurred cover art background, floating cover card,
 * price deal cards, and a history nudge in sanctuary style.
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  ChevronRight,
  Tag,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import { compareGame, type GameDetails } from '@/lib/api';
import { PriceTable } from '@/components/price-table';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { AddToWishlistButton } from './add-to-wishlist-button';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ');
  return {
    title: name.charAt(0).toUpperCase() + name.slice(1),
    description: `Compare prices for ${name} on Steam, Epic Games, GOG, and Xbox. Find the cheapest deal.`,
  };
}

// ---------------------------------------------------------------------------
// Placeholder
// ---------------------------------------------------------------------------

function buildPlaceholderGame(slug: string): GameDetails {
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    name,
    slug,
    description:
      'Detailed game description will be shown here once the API is connected. This placeholder text is shown when the scrapper service is not reachable.',
    releaseDate: '2024-01-01',
    genres: ['Action', 'RPG'],
    developer: 'Unknown Studio',
    publisher: 'Unknown Publisher',
    stores: [
      { store: 'steam',     price: 39.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'epic',      price: 44.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'gog',       price: 34.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: false },
    ],
  };
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function Breadcrumb({ gameName }: { gameName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-on-surface-variant/60 font-body">
      <Link href="/" className="hover:text-primary-container transition-colors">Home</Link>
      <ChevronRight className="h-3 w-3" aria-hidden="true" />
      <Link href="/search?q=" className="hover:text-primary-container transition-colors">Games</Link>
      <ChevronRight className="h-3 w-3" aria-hidden="true" />
      <span className="text-on-surface-variant truncate max-w-[200px]">{gameName}</span>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Cinematic hero — blurred backdrop + floating cover card
// ---------------------------------------------------------------------------

interface GameHeroProps {
  game: GameDetails;
}

function GameHero({ game }: GameHeroProps) {
  const lowestStore = [...game.stores]
    .filter((s) => s.inStock && s.price != null)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0];

  return (
    /* Outer cinematic section — full width with blurred art behind */
    <section className="relative w-full overflow-hidden rounded-2xl mb-8 bg-surface-container-low">
      {/* Blurred cover art backdrop */}
      {game.coverImage && (
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={game.coverImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-15 blur-2xl scale-110"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(20,12,12,0.95) 0%, rgba(20,12,12,0.75) 50%, rgba(20,12,12,0.85) 100%)',
            }}
          />
        </div>
      )}

      {/* Ambient warm blob */}
      <div
        className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #ff9a5d 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* 21st.dev CardSpotlight — mouse-tracking warm spotlight across the hero content */}
      <CardSpotlight
        className="relative z-10 !rounded-none bg-transparent"
        radius={450}
        color="rgba(255, 154, 93, 0.07)"
      >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-8 lg:p-10">
        {/* Floating cover art card */}
        <div
          className="shrink-0 w-36 md:w-44 lg:w-52 self-start rounded-2xl overflow-hidden shadow-ambient-lg"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,154,93,0.10)' }}
        >
          <div className="aspect-[3/4] relative bg-surface-container">
            {game.coverImage ? (
              <Image
                src={game.coverImage}
                alt={`${game.name} cover art`}
                fill
                priority
                sizes="(max-width: 768px) 144px, 208px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: 'linear-gradient(160deg, #221816 0%, #3d2e2c 100%)' }}
              >
                <span
                  className="font-headline text-5xl font-bold select-none"
                  style={{ color: 'rgba(255,154,93,0.25)' }}
                >
                  {game.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Game info */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Title */}
          <h1 className="font-headline font-bold text-on-surface leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.01em' }}
          >
            {game.name}
          </h1>

          {/* Meta — genres + release year + dev/pub */}
          <div className="flex flex-wrap items-center gap-2">
            {game.genres?.map((g) => (
              <span
                key={g}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-headline"
                style={{ background: 'rgba(155,126,200,0.12)', color: '#b49bd6' }}
              >
                {g}
              </span>
            ))}
            {game.releaseDate && (
              <div className="flex items-center gap-1 text-xs text-on-surface-variant/60 font-body">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {new Date(game.releaseDate).getFullYear()}
              </div>
            )}
          </div>

          {/* Dev / publisher */}
          {(game.developer ?? game.publisher) && (
            <div className="flex flex-wrap gap-4">
              {game.developer && (
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 font-body">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{game.developer}</span>
                </div>
              )}
              {game.publisher && (
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 font-body">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{game.publisher}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {game.description && (
            <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 font-body max-w-xl">
              {game.description}
            </p>
          )}

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {/* Best price display */}
            {lowestStore && (
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant/60 font-body">Best price</span>
                <span className="font-headline text-3xl font-bold" style={{ color: '#ff9a5d' }}>
                  {formatPrice(lowestStore.price, lowestStore.currency)}
                </span>
              </div>
            )}

            {/* Primary CTA */}
            {lowestStore && (
              <Link
                href={lowestStore.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl btn-sunset font-headline font-semibold text-sm transition-all duration-200 active:scale-[0.97] hover:shadow-glow-primary-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/50"
              >
                Get Best Deal
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}

            {/* Wishlist — client island */}
            <AddToWishlistButton game={game} />

            {/* Price history */}
            <Link
              href={`/game/${game.slug}/history`}
              className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl glass ghost-border font-headline font-semibold text-sm text-on-surface transition-all duration-200 hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/30"
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              Price History
            </Link>
          </div>
        </div>
      </div>
      </CardSpotlight>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function GameDetailSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container p-8 flex flex-col md:flex-row gap-8">
      <Skeleton className="w-44 aspect-[3/4] rounded-2xl" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-9 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  let game: GameDetails;

  try {
    const title = slug.replace(/-/g, ' ');
    game = await compareGame(title);
  } catch {
    game = buildPlaceholderGame(slug);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Breadcrumb gameName={game.name} />
      </div>

      {/* Cinematic hero */}
      <GameHero game={game} />

      {/* Price deal cards */}
      <section aria-labelledby="price-comparison-heading" className="mb-6">
        <PriceTable stores={game.stores} />
      </section>

      {/* History nudge */}
      <div className="relative rounded-2xl bg-surface-container overflow-hidden p-5 flex items-center justify-between gap-4 flex-wrap">
        {/* Subtle blob */}
        <div
          className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #9b7ec8 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <p className="text-sm font-semibold text-on-surface font-headline">
            Want to see how prices change over time?
          </p>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Check the full price history and know the perfect time to buy.
          </p>
        </div>
        <Link
          href={`/game/${slug}/history`}
          className="relative z-10 inline-flex items-center gap-2 h-10 px-5 rounded-xl glass ghost-border font-headline font-semibold text-sm text-on-surface transition-all duration-200 hover:bg-surface-container-high whitespace-nowrap"
        >
          View History
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

