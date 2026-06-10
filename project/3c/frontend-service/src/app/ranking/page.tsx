'use client';

/**
 * Ranking page — client component.
 * 
 * Public: fetches the top trending discounts from the ranking-service.
 * Displays ranked games with their current discount, price, and store.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { formatPrice, storeLabel, cn } from '@/lib/utils';
import { getRanking, type RankedGame, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function RankingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 rounded-2xl p-5 bg-surface-container ghost-border">
          <Skeleton className="h-24 w-18 rounded-lg shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function RankingError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-16 w-16 rounded-2xl bg-error-container/15 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
      </div>
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">
        Failed to load rankings
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs">{message}</p>
      <Button variant="tactical" className="mt-6" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ranking game row
// ---------------------------------------------------------------------------

interface RankingRowProps {
  game: RankedGame;
}

function RankingRow({ game }: RankingRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-6 rounded-2xl p-5 transition-all duration-200',
        'bg-surface-container ghost-border hover:bg-surface-container-high hover:shadow-ambient-lg',
      )}
    >
      {/* Rank Indicator */}
      <div className="hidden sm:flex flex-col items-center justify-center w-12 shrink-0">
        {game.rank <= 3 ? (
          <Trophy className={cn(
            "h-6 w-6",
            game.rank === 1 ? "text-yellow-400" : 
            game.rank === 2 ? "text-slate-300" : 
            "text-amber-600"
          )} />
        ) : (
          <span className="font-headline text-2xl font-bold text-on-surface-variant/20 italic">
            #{game.rank}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative h-24 w-18 shrink-0 overflow-hidden rounded-lg bg-surface-container-low shadow-sm">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={`${game.name} cover`}
            fill
            sizes="72px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-headline text-2xl font-bold text-on-surface-variant/30 select-none">
              {game.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
        {/* Discount badge overlay for mobile */}
        <div className="absolute top-1 left-1 sm:hidden">
            <Badge className="bg-primary-container text-on-primary-container text-[10px] px-1 py-0 border-none">
                -{game.discountPct}%
            </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
            <Link
            href={`/game/${game.slug}`}
            className="font-headline text-lg font-bold text-on-surface hover:text-primary-fixed-dim transition-colors truncate block"
            >
            {game.name}
            </Link>
            <Badge variant="outline" className="hidden md:inline-flex text-[10px] font-semibold bg-surface-container-highest/30">
                {storeLabel(game.store)}
            </Badge>
        </div>
        
        <div className="flex items-center gap-3 mt-2">
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary-container">
                    {formatPrice(game.priceCents / 100, game.currency)}
                </span>
                <span className="text-xs text-on-surface-variant line-through opacity-60">
                    {formatPrice(game.originalPriceCents / 100, game.currency)}
                </span>
            </div>
            
            <Badge className="bg-primary-container/20 text-primary-container border-primary-container/20 px-2 py-1 font-bold text-sm hidden sm:inline-flex">
                -{game.discountPct}% OFF
            </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Button variant="sunset" size="lg" className="rounded-xl shadow-sunset" asChild>
          <Link
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Get Deal</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <Link 
            href={`/game/${game.slug}`} 
            className="text-xs text-on-surface-variant hover:text-primary-container flex items-center gap-1 transition-colors mr-2"
        >
            View details <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RankingPage() {
  const [games, setGames] = useState<RankedGame[]>([]);
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getRanking();
        setGames(response.rankings);
        setGeneratedAt(response.generatedAt);
        setPageState('ready');
      } catch (err) {
        setErrorMessage('Ranking service is temporarily unavailable. Please check back later.');
        setPageState('error');
      }
    }

    load();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      {/* Page header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-primary-container/15 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary-container" aria-hidden="true" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Best Trending Game Discounts
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-on-surface-variant text-sm md:text-base max-w-xl">
                Real-time leaderboard of the most aggressive price drops across Steam, GOG, Epic, and Microsoft Store.
            </p>
            {generatedAt && (
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-medium">
                    Updated {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
        </div>
        <div className="h-1 w-24 bg-primary-container rounded-full mt-6 mx-auto sm:mx-0" />
      </div>

      {/* States */}
      {pageState === 'loading' && <RankingSkeleton />}

      {pageState === 'error' && <RankingError message={errorMessage} />}

      {pageState === 'ready' && games.length === 0 && (
        <div className="text-center py-24 opacity-40">
            <p className="font-headline text-lg">No active discounts found at this moment.</p>
        </div>
      )}

      {pageState === 'ready' && games.length > 0 && (
        <div className="space-y-4">
          {games.map((game) => (
            <RankingRow key={`${game.store}-${game.slug}`} game={game} />
          ))}
          
          <div className="mt-12 p-8 rounded-3xl bg-surface-container-low border border-dashed border-on-surface-variant/10 text-center">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">
                Don&apos;t miss the next big drop
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto">
                Our ranking service constantly analyzes thousands of price points to bring you the best deals first.
            </p>
            <div className="flex items-center justify-center gap-4">
                <Button variant="tactical" asChild>
                    <Link href="/search?q=">Browse all games</Link>
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
