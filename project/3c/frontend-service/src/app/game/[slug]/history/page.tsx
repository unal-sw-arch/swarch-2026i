/**
 * Price history page — server component shell.
 *
 * TODO: This page requires a price history endpoint on the scrapper service
 * (e.g. GET /api/v1/games/history?name=<name>) which is not yet implemented.
 * The chart area is reserved but uses placeholder data.
 *
 * A suitable charting library: recharts (lightweight, React-native, SSR-friendly).
 * Install: npm install recharts
 * Chart component should be 'use client' since it needs DOM APIs.
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Bell, TrendingDown, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

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
    title: `Price History — ${name.charAt(0).toUpperCase() + name.slice(1)}`,
    description: `Historical price data for ${name} across all stores.`,
  };
}

// ---------------------------------------------------------------------------
// Types — will be returned from the history API once implemented
// ---------------------------------------------------------------------------

interface PricePoint {
  date: string;
  price: number;
  store: string;
  currency: string;
}

interface StoreHistorySummary {
  store: string;
  currentPrice: number;
  lowestEver: number;
  highestEver: number;
  currency: string;
  pricePoints: PricePoint[];
}

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

function buildPlaceholderHistory(slug: string): StoreHistorySummary[] {
  const name = slug.replace(/-/g, ' ');
  void name; // used for future API call

  return [
    {
      store: 'steam',
      currentPrice: 39.99,
      lowestEver: 14.99,
      highestEver: 59.99,
      currency: 'USD',
      pricePoints: [
        { date: '2024-01-01', price: 59.99, store: 'steam', currency: 'USD' },
        { date: '2024-03-15', price: 44.99, store: 'steam', currency: 'USD' },
        { date: '2024-06-20', price: 29.99, store: 'steam', currency: 'USD' },
        { date: '2024-08-01', price: 14.99, store: 'steam', currency: 'USD' },
        { date: '2024-09-01', price: 39.99, store: 'steam', currency: 'USD' },
      ],
    },
    {
      store: 'epic',
      currentPrice: 44.99,
      lowestEver: 19.99,
      highestEver: 59.99,
      currency: 'USD',
      pricePoints: [
        { date: '2024-01-01', price: 59.99, store: 'epic', currency: 'USD' },
        { date: '2024-04-01', price: 39.99, store: 'epic', currency: 'USD' },
        { date: '2024-07-15', price: 19.99, store: 'epic', currency: 'USD' },
        { date: '2024-09-01', price: 44.99, store: 'epic', currency: 'USD' },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Chart placeholder — replace with actual recharts component
// ---------------------------------------------------------------------------

function ChartPlaceholder() {
  return (
    <div className="relative w-full h-64 rounded-xl bg-surface-container-low ghost-border overflow-hidden flex items-center justify-center">
      {/* Grid lines suggestion */}
      <div className="absolute inset-0 sanctuary-depth opacity-100" aria-hidden="true" />

      {/* Simulated chart line using SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 600 256"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points="0,200 120,180 240,100 320,220 400,80 500,140 600,120"
          fill="none"
          stroke="#00e639"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,200 120,180 240,100 320,220 400,80 500,140 600,120"
          fill="url(#chartGradient)"
          opacity="0.15"
        />
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e639" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00e639" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative text-center px-4">
        <p className="text-sm font-medium text-on-surface-variant mb-1">
          Interactive chart coming soon
        </p>
        <p className="text-xs text-on-surface-variant/60">
          TODO: Integrate <code className="text-primary-fixed-dim">recharts</code> once the
          history API endpoint is available.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Store history card
// ---------------------------------------------------------------------------

interface StoreHistoryCardProps {
  history: StoreHistorySummary;
}

function StoreHistoryCard({ history }: StoreHistoryCardProps) {
  const discountFromHigh = Math.round(
    ((history.highestEver - history.currentPrice) / history.highestEver) * 100,
  );

  const isAtLowest = history.currentPrice === history.lowestEver;

  return (
    <div className="rounded-xl bg-surface-container ghost-border p-5 flex flex-col gap-4">
      {/* Store label */}
      <div className="flex items-center justify-between">
        <h3 className="font-headline font-semibold text-on-surface capitalize">
          {history.store === 'microsoft' ? 'Xbox / PC Game Pass' : history.store.charAt(0).toUpperCase() + history.store.slice(1)}
        </h3>
        {isAtLowest && (
          <Badge variant="success" className="flex items-center gap-0.5">
            <TrendingDown className="h-2.5 w-2.5" />
            All-time low
          </Badge>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Current</span>
          <span className="font-headline font-bold text-on-surface text-base">
            {formatPrice(history.currentPrice, history.currency)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Lowest ever</span>
          <span className="font-headline font-bold text-primary-fixed-dim text-base">
            {formatPrice(history.lowestEver, history.currency)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Highest</span>
          <span className="font-headline font-bold text-on-surface-variant text-base">
            {formatPrice(history.highestEver, history.currency)}
          </span>
        </div>
      </div>

      {discountFromHigh > 0 && (
        <p className="text-xs text-on-surface-variant">
          Currently <span className="text-primary-fixed-dim font-semibold">{discountFromHigh}% off</span> the launch price.
        </p>
      )}

      {/* Recent price events */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Recent changes</span>
        <div className="space-y-1">
          {history.pricePoints.slice(-3).reverse().map((point) => (
            <div key={point.date} className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">
                {new Date(point.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="font-medium text-on-surface">
                {formatPrice(point.price, point.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert setup section
// ---------------------------------------------------------------------------

function AlertSetupSection({ slug }: { slug: string }) {
  return (
    <div className="rounded-xl bg-surface-container ghost-border p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
          <Bell className="h-4 w-4 text-primary-container" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-headline font-semibold text-on-surface">
            Price Alert
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Get notified when this game drops below your target price.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/**
         * TODO: Implement PriceAlertForm — client component with:
         *   - Target price input
         *   - Store selector (optional)
         *   - POST to user-service alert endpoint (not yet scaffolded)
         *
         * For now, show a placeholder CTA.
         */}
        <div className="flex-1 min-w-[200px] rounded-lg bg-surface-container-low border border-outline-variant/15 px-3 py-2 text-sm text-on-surface-variant/60">
          $ Enter target price...
        </div>
        <Button disabled variant="tactical" className="shrink-0">
          <Bell className="h-4 w-4 mr-1.5" />
          Set Alert
          <Badge variant="outline" className="ml-2 text-[9px]">Soon</Badge>
        </Button>
      </div>

      <p className="mt-3 text-[10px] text-on-surface-variant/50">
        Alerts are delivered via email. Requires a GameSeeker account.
        Price alert feature requires{' '}
        <code className="text-primary-fixed-dim/70">user-service</code> alert endpoints.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface HistoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PriceHistoryPage({ params }: HistoryPageProps) {
  const { slug } = await params;
  const gameName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  /**
   * TODO: Replace with real history API call when available:
   *   const historyData = await getGameHistory(gameName);
   *
   * The scrapper service would need a new endpoint, e.g.:
   *   GET /api/v1/games/history?name=<name>&days=90
   */
  const historyData = buildPlaceholderHistory(slug);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary-fixed-dim transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/game/${slug}`} className="hover:text-primary-fixed-dim transition-colors">
          {gameName}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-on-surface">Price History</span>
      </nav>

      {/* Page title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="h-5 w-5 text-primary-container" aria-hidden="true" />
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Price History
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">{gameName}</p>
        <div className="h-px bg-gradient-to-r from-primary-container/30 to-transparent mt-3" />
      </div>

      {/* API notice */}
      <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-tertiary-container/10 border border-tertiary-container/20 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-tertiary-container shrink-0 mt-0.5" />
        <p className="text-xs text-on-surface-variant">
          Price history data is not yet available — the scrapper service does not persist
          historical records. This page shows{' '}
          <span className="text-on-surface font-medium">placeholder data</span> until a
          history endpoint is implemented.
        </p>
      </div>

      {/* Chart */}
      <section className="mb-8" aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="font-headline text-base font-semibold text-on-surface mb-3">
          Price Trend (All Stores)
        </h2>
        <ChartPlaceholder />
      </section>

      <Separator className="mb-8" />

      {/* Per-store history cards */}
      <section className="mb-8" aria-labelledby="store-history-heading">
        <h2 id="store-history-heading" className="font-headline text-base font-semibold text-on-surface mb-4">
          Store Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {historyData.map((h) => (
            <StoreHistoryCard key={h.store} history={h} />
          ))}
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Alert setup */}
      <section aria-labelledby="alert-heading">
        <h2 id="alert-heading" className="font-headline text-base font-semibold text-on-surface mb-4">
          Set Price Alert
        </h2>
        <AlertSetupSection slug={slug} />
      </section>
    </div>
  );
}
