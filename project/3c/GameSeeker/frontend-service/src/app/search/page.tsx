/**
 * Search results page — server component.
 *
 * Reads `?q=` from the URL. Calls searchGames(q) on the server.
 * Falls back to empty state / error state gracefully.
 */

import React from 'react';
import type { Metadata } from 'next';
import { Search, SlidersHorizontal, AlertTriangle } from 'lucide-react';

import { searchGames, type GameSummary } from '@/lib/api';
import { GameCard } from '@/components/game-card';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim();
  return {
    title: q ? `Results for "${q}"` : 'Search Games',
    description: q
      ? `Compare game prices for "${q}" across Steam, Epic, GOG, and Xbox.`
      : 'Search for any game and compare prices across all major PC stores.',
  };
}

// ---------------------------------------------------------------------------
// Store filter pills
// ---------------------------------------------------------------------------

const STORES = [
  { key: 'steam', label: 'Steam' },
  { key: 'epic', label: 'Epic' },
  { key: 'gog', label: 'GOG' },
  { key: 'microsoft', label: 'Xbox' },
];

interface FilterBarProps {
  query: string;
  activeStore?: string;
  total: number;
}

function FilterBar({ query, total }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-on-surface-variant">
          {total > 0 ? (
            <>
              <span className="font-semibold text-on-surface">{total}</span> result
              {total !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold text-primary-fixed-dim">
                &quot;{query}&quot;
              </span>
            </>
          ) : (
            <>Searching for <span className="font-semibold text-primary-fixed-dim">&quot;{query}&quot;</span></>
          )}
        </span>
      </div>

      {/* TODO: wire store filters as ?store= query param */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
        {STORES.map((s) => (
          <Badge key={s.key} variant="outline" className="cursor-pointer hover:border-primary-container/40 hover:text-primary-fixed-dim transition-colors text-xs">
            {s.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-16 w-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
        <Search className="h-7 w-7 text-on-surface-variant/50" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        No results found
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs">
        We couldn&apos;t find any games matching{' '}
        <span className="font-medium text-on-surface">&quot;{query}&quot;</span>.
        Try a different title or check the spelling.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-16 w-16 rounded-2xl bg-error-container/15 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        Search failed
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prompt state — no query entered
// ---------------------------------------------------------------------------

function PromptState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-16 w-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
        <Search className="h-7 w-7 text-primary-container/60" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        Start searching
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs">
        Enter a game title in the search bar above to compare prices across all stores.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface SearchPageProps {
  searchParams: Promise<{ q?: string; store?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, store: _store } = await searchParams;
  const rawQuery = q?.trim() ?? '';

  let games: GameSummary[] = [];
  let fetchError: string | null = null;

  if (rawQuery) {
    try {
      /**
       * TODO: Once the API gateway is live, this call will resolve real data.
       * The API client already handles credentials forwarding.
       */
      games = await searchGames(rawQuery);
    } catch {
      fetchError = 'The search service is currently unavailable. Please try again shortly.';
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-1">
          Search Results
        </h1>
        <div className="h-px bg-gradient-to-r from-primary-container/30 to-transparent" />
      </div>

      {rawQuery && !fetchError && (
        <div className="mb-6">
          <FilterBar query={rawQuery} total={games.length} />
        </div>
      )}

      {/* States */}
      {!rawQuery && <PromptState />}

      {rawQuery && fetchError && <ErrorState message={fetchError} />}

      {rawQuery && !fetchError && games.length === 0 && (
        <EmptyState query={rawQuery} />
      )}

      {rawQuery && !fetchError && games.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.slug ?? game.name} game={game} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
