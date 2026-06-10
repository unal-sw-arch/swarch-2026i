/**
 * Landing page — server component.
 *
 * Sections:
 *   1. Hero — atmospheric with ambient blobs, display headline, sunset CTA
 *   2. Store trust bar — "live prices from X stores"
 *   3. Trending games shelf — horizontal scrollable Game Cases
 *   4. Features — tonal depth cards, generous spacing
 */

import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Tag, TrendingUp } from 'lucide-react';

import { GameCard } from '@/components/game-card';
import { BentoFeatures } from '@/components/bento-features';
import { HeroShader } from '@/components/hero-shader';
import { type GameSummary } from '@/lib/api';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const PLACEHOLDER_GAMES: GameSummary[] = [
  {
    name: 'Elden Ring',
    slug: 'elden-ring',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    stores: [
      { store: 'steam', price: 39.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'epic', price: 44.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
  {
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg',
    stores: [
      { store: 'gog', price: 29.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'steam', price: 35.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
  {
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg',
    stores: [
      { store: 'steam', price: 59.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'gog', price: 59.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
  {
    name: 'Halo Infinite',
    slug: 'halo-infinite',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1240440/library_600x900.jpg',
    stores: [
      { store: 'microsoft', price: 0, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'steam', price: 39.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
  {
    name: 'Alan Wake 2',
    slug: 'alan-wake-2',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/2370650/library_600x900.jpg',
    stores: [
      { store: 'epic', price: 49.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
  {
    name: 'Dead Space Remake',
    slug: 'dead-space-remake',
    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1693980/library_600x900.jpg',
    stores: [
      { store: 'steam', price: 34.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
      { store: 'epic', price: 39.99, originalPrice: 59.99, currency: 'USD', url: '#', inStock: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center pt-8 pb-20">
      {/* 21st.dev ShaderBackground — warm plasma wave, WebGL, reduced-motion safe */}
      <HeroShader opacity={0.85} />

      {/* Vignette overlay to darken edges and improve text legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(20,12,12,0.75) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Bottom fade so sections below transition smoothly */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 z-[1]"
        style={{ background: 'linear-gradient(to bottom, transparent, #140c0c)' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-[2]">
        {/* Eyebrow pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full glass ghost-border px-4 py-1.5 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse" />
          <span className="text-xs font-semibold font-headline text-primary-container tracking-wider uppercase">
            Live prices from 4 stores
          </span>
        </div>

        {/* Display headline */}
        <h1 className="font-headline font-bold leading-tight mb-6 animate-fade-in-up"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}
        >
          <span className="text-on-surface">Find the Best</span>
          <br />
          <span className="text-gradient-sunset">Game Deals.</span>
          <br />
          <span className="text-on-surface/70 font-medium" style={{ fontSize: '65%' }}>
            Before Anyone Else.
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-base text-on-surface-variant leading-relaxed mb-10 font-body animate-fade-in-up"
          style={{ animationDelay: '80ms' }}
        >
          Real-time price intelligence across Steam, Epic Games, GOG, and Xbox.
          Save to your wishlist, track every deal, and never overpay again.
        </p>

        {/* Hero search */}
        <form
          action="/search"
          method="GET"
          className="mx-auto flex max-w-2xl items-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/50 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              placeholder="Search for any game..."
              className="w-full h-14 rounded-2xl bg-surface-container pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant/40 ghost-border focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/40 transition-all font-body"
              aria-label="Search for a game"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="h-14 px-8 rounded-2xl btn-sunset font-headline font-semibold text-sm whitespace-nowrap transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/50 flex items-center gap-2"
          >
            Search
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {/* Store quick links */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap animate-fade-in"
          style={{ animationDelay: '250ms' }}
        >
          <span className="text-xs text-on-surface-variant/50 font-body mr-1">Browse:</span>
          {[
            { key: 'steam', label: 'Steam' },
            { key: 'epic', label: 'Epic Games' },
            { key: 'gog', label: 'GOG' },
            { key: 'microsoft', label: 'Xbox' },
          ].map(({ key, label }) => (
            <Link
              key={key}
              href={`/search?q=&store=${key}`}
              className="text-xs text-on-surface-variant/60 hover:text-primary-container transition-colors font-body ghost-border rounded-full px-3 py-1 hover:border-primary-container/30 bg-surface-container-low/50"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Store trust bar
// ---------------------------------------------------------------------------

const STORES = [
  { name: 'Steam', abbr: 'S', color: '#4a8dca' },
  { name: 'Epic Games', abbr: 'E', color: '#ffffff' },
  { name: 'GOG', abbr: 'G', color: '#b95fe1' },
  { name: 'Xbox', abbr: 'X', color: '#5fba5f' },
];

function TrustBar() {
  return (
    <section className="py-6 border-y border-outline-variant/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <span className="text-xs text-on-surface-variant/50 font-body uppercase tracking-widest">
            Live prices from
          </span>
          {STORES.map((store) => (
            <div key={store.name} className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold font-headline"
                style={{ background: `${store.color}18`, color: store.color }}
              >
                {store.abbr}
              </div>
              <span className="text-sm text-on-surface-variant font-body">{store.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-tertiary-container" aria-hidden="true" />
            <span className="text-xs text-on-surface-variant/60 font-body">Updated in real-time</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Trending shelf
// ---------------------------------------------------------------------------

interface TrendingShelfProps {
  title: string;
  subtitle?: string;
  games: GameSummary[];
}

function TrendingShelf({ title, subtitle, games }: TrendingShelfProps) {
  return (
    <section className="py-14">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary-container" aria-hidden="true" />
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-sm text-on-surface-variant font-body">{subtitle}</p>
            )}
          </div>
          <Link
            href="/search?q="
            className="flex items-center gap-1 text-xs text-on-surface-variant/60 hover:text-primary-container transition-colors font-body"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {/* Game Case grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}


// ---------------------------------------------------------------------------
// Bottom CTA banner
// ---------------------------------------------------------------------------

function CtaBanner() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl bg-surface-container overflow-hidden p-12 text-center">
          {/* Ambient blob */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] opacity-[0.08]"
            style={{ background: 'radial-gradient(ellipse, #ff9a5d 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3">
              Never overpay again.
            </h2>
            <p className="text-on-surface-variant font-body mb-8 max-w-md mx-auto">
              Create a free account to save your wishlist and track prices across every major store.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl btn-sunset font-headline font-semibold text-sm transition-all duration-200 active:scale-[0.97] hover:shadow-glow-primary-lg"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/search?q="
                className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl glass ghost-border font-headline font-semibold text-sm text-on-surface transition-all duration-200 hover:bg-surface-container-high"
              >
                Browse Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  /**
   * TODO: Fetch real trending data from the API gateway:
   *
   * const [steamTrending, epicTrending] = await Promise.allSettled([
   *   getTrending('steam'),
   *   getTrending('epic'),
   * ]);
   * const steamGames = steamTrending.status === 'fulfilled' ? steamTrending.value : [];
   */

  const featuredGames = PLACEHOLDER_GAMES.slice(0, 6);

  return (
    <>
      <HeroSection />
      <TrustBar />
      <TrendingShelf
        title="Trending Deals"
        subtitle="Best prices right now across all stores"
        games={featuredGames}
      />
      <BentoFeatures />
      <CtaBanner />
    </>
  );
}
