import React from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, XCircle, TrendingDown, Trophy } from 'lucide-react';

import { type StorePriceSummary } from '@/lib/api';
import { cn, formatPrice, storeLabel, discountPercent } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PriceTableProps {
  stores: StorePriceSummary[];
  bestStore?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Store identity
// ---------------------------------------------------------------------------

const STORE_PALETTE: Record<string, { accent: string; bg: string; label: string }> = {
  steam:     { accent: '#4a8dca', bg: 'rgba(74,141,202,0.10)',  label: 'Steam' },
  epic:      { accent: '#e0e0e0', bg: 'rgba(224,224,224,0.06)', label: 'Epic Games' },
  gog:       { accent: '#b95fe1', bg: 'rgba(185,95,225,0.10)',  label: 'GOG' },
  microsoft: { accent: '#5fba5f', bg: 'rgba(95,186,95,0.10)',   label: 'Xbox' },
};

function getStore(key: string) {
  return STORE_PALETTE[key.toLowerCase()] ?? {
    accent: '#c4a8a5',
    bg: 'rgba(196,168,165,0.06)',
    label: key,
  };
}

// ---------------------------------------------------------------------------
// Deal Card — one per store
// ---------------------------------------------------------------------------

interface DealCardProps {
  entry: StorePriceSummary;
  isBest: boolean;
  rank: number;
}

function DealCard({ entry, isBest, rank }: DealCardProps) {
  const store = getStore(entry.store);
  const discount =
    entry.originalPrice != null && entry.price != null
      ? discountPercent(entry.originalPrice, entry.price)
      : null;

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-200',
        isBest
          ? 'bg-surface-container-high'
          : 'bg-surface-container hover:bg-surface-container-high',
      )}
      style={isBest ? { boxShadow: `0 0 0 1px ${store.accent}22, 0 8px 24px rgba(255,154,93,0.08)` } : {}}
    >
      {/* Best deal crown */}
      {isBest && (
        <div
          className="absolute -top-2.5 -right-1 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold font-headline"
          style={{ background: 'linear-gradient(135deg, #ff9a5d, #f9873e)', color: '#1c0800' }}
        >
          <Trophy className="h-2.5 w-2.5" aria-hidden="true" />
          Best Deal
        </div>
      )}

      {/* Rank */}
      <span
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-[11px] font-bold font-headline"
        style={
          rank === 1
            ? { background: 'linear-gradient(135deg, #ff9a5d, #f9873e)', color: '#1c0800' }
            : { background: 'rgba(255,255,255,0.06)', color: '#c4a8a5' }
        }
      >
        {rank}
      </span>

      {/* Store icon */}
      <div
        className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold font-headline"
        style={{ background: store.bg, color: store.accent }}
      >
        {entry.store.slice(0, 2).toUpperCase()}
      </div>

      {/* Store name + availability */}
      <div className="flex-1 min-w-0">
        <p className="font-headline font-semibold text-sm text-on-surface">
          {storeLabel(entry.store)}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {entry.inStock ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-tertiary-container shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-tertiary-container font-body">Available</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 text-error shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-error font-body">Unavailable</span>
            </>
          )}
        </div>
      </div>

      {/* Pricing info */}
      <div className="shrink-0 text-right flex flex-col items-end gap-1">
        {/* Current price */}
        <span
          className="font-headline font-bold text-lg"
          style={{ color: isBest ? '#ff9a5d' : '#f0dbd9' }}
        >
          {entry.price != null ? formatPrice(entry.price, entry.currency) : 'N/A'}
        </span>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Original price */}
          {entry.originalPrice != null && entry.originalPrice !== entry.price && (
            <span className="text-xs text-on-surface-variant/50 line-through font-body">
              {formatPrice(entry.originalPrice, entry.currency)}
            </span>
          )}
          {/* Discount */}
          {discount != null && discount > 0 && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold font-headline"
              style={{ background: 'rgba(93,184,150,0.15)', color: '#7ecfb1' }}
            >
              <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* CTA button */}
      {entry.inStock && entry.url ? (
        <Link
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold font-headline transition-all duration-200',
            isBest
              ? 'btn-sunset hover:shadow-glow-primary active:scale-[0.97]'
              : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high',
          )}
        >
          Buy
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      ) : (
        <span className="shrink-0 text-xs text-on-surface-variant/40 font-body px-4">
          N/A
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function PriceTable({ stores, bestStore, className }: PriceTableProps) {
  const sorted = [...stores].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });

  const computedBest =
    bestStore ?? sorted.find((s) => s.inStock && s.price != null)?.store;

  if (stores.length === 0) {
    return (
      <div className={cn('rounded-2xl bg-surface-container p-8 text-center', className)}>
        <p className="text-on-surface-variant text-sm font-body">
          No price data available for this title yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-headline font-semibold text-on-surface text-sm">
          Price Comparison
        </h2>
        <span className="text-xs text-on-surface-variant/60 font-body">
          {stores.filter((s) => s.inStock).length} of {stores.length}{' '}
          {stores.length === 1 ? 'store' : 'stores'} available
        </span>
      </div>

      {/* Deal cards */}
      {sorted.map((entry, idx) => (
        <DealCard
          key={entry.store}
          entry={entry}
          isBest={entry.store === computedBest}
          rank={idx + 1}
        />
      ))}

      {/* Footer note */}
      <p className="text-[10px] text-on-surface-variant/40 font-body text-center pt-1">
        Prices scraped in real-time — verify at checkout.
      </p>
    </div>
  );
}
