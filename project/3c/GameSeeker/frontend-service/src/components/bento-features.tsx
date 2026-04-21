'use client';

/**
 * BentoFeatures — "Your gaming sanctuary" section.
 *
 * 2×2 bento grid showcasing product strengths.
 * Each cell has a GlowingEffect pointer-tracking conic gradient border.
 * Store icons from react-icons/si.
 * Game covers from Steam CDN.
 */

import React from 'react';
import Image from 'next/image';
import { TrendingUp, BookOpen, Zap } from 'lucide-react';
import {
  SiSteam,
  SiEpicgames,
  SiGogdotcom,
} from 'react-icons/si';

// Xbox doesn't have an SI icon — use a minimal SVG mark
function XboxIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M4.102 5.885C5.887 3.887 8.29 2.617 11 2.5c1.47.02 2.87.42 4.09 1.1C13.31 5.04 11.62 7.05 10.5 9.19c-1.36-1.41-4.01-3.03-6.4-3.3zm-.94 1.19C2.425 8.395 2 10.15 2 12c0 2.31.78 4.44 2.08 6.14 1.55-2.53 3.13-4.87 3.14-6.97.01-1.55-1.3-3.1-3.06-4.09zM12 21.5c2.71-.09 5.12-1.36 6.9-3.37-2.38.27-5.02-1.35-6.41-2.76-1.12 2.14-2.81 4.15-4.59 5.59A9.46 9.46 0 0 0 12 21.5zm7.85-3.37C21.21 16.44 22 14.31 22 12c0-1.85-.43-3.6-1.19-5.15-1.76.99-3.07 2.54-3.06 4.09.01 2.1 1.59 4.44 3.14 6.97a9.66 9.66 0 0 0 .96-.78zM14.17 8.1C13.5 6.25 11.94 4.67 9.92 3.6 10.56 3.2 11.26 3 12 3c.74 0 1.44.2 2.08.6-1.02.81-1.7 1.77-1.91 2.61.35.57.68 1.19 1 1.84l1 .05zm-4.34 0c.32-.65.65-1.27 1-1.84-.21-.84-.89-1.8-1.91-2.61.64-.4 1.34-.6 2.08-.6.74 0 1.44.2 2.08.6-1.02.81-1.7 1.77-1.91 2.61.35.57.68 1.19 1 1.84l-2.34-.05v.05zm2.17 5.58c-1.4 1.42-4.06 3.08-6.47 3.35A9.43 9.43 0 0 0 7.1 18.9c1.16-1.12 3.07-3.14 4.07-5.26l.63.04zm0 0c1 2.12 2.91 4.14 4.07 5.26.9-.52 1.7-1.19 2.37-1.97-2.41-.27-5.07-1.93-6.47-3.35l.03.06z" />
    </svg>
  );
}
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Bento cell wrapper — applies GlowingEffect + common padding
// ---------------------------------------------------------------------------

interface BentoCellProps {
  children: React.ReactNode;
  className?: string;
  glowSpread?: number;
}

function BentoCell({ children, className, glowSpread = 28 }: BentoCellProps) {
  return (
    <div className={cn('relative rounded-3xl overflow-hidden', className)}>
      <GlowingEffect spread={glowSpread} borderWidth={1.5} proximity={80} />
      <div className="relative z-10 h-full rounded-3xl bg-surface-container border border-outline-variant/10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 1 — Live Price Intelligence (wide)
// ---------------------------------------------------------------------------

const DEMO_PRICES = [
  { store: 'Steam',    icon: SiSteam,     color: '#4a8dca', price: 35.99, original: 59.99 },
  { store: 'Epic',     icon: SiEpicgames, color: '#e8e8e8', price: 44.99, original: 59.99 },
  { store: 'GOG',      icon: SiGogdotcom,       color: '#b95fe1', price: 29.99, original: 59.99 },
  { store: 'Xbox',     icon: XboxIcon,      color: '#5fba5f', price: 39.99, original: 59.99 },
];

function PriceIntelligenceCell() {
  const best = DEMO_PRICES.reduce((a, b) => (a.price < b.price ? a : b));

  return (
    <div className="flex flex-col h-full p-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary-container" aria-hidden="true" />
        <h3 className="font-headline font-semibold text-base text-on-surface">
          Live Price Intelligence
        </h3>
        <span className="ml-auto text-[10px] font-semibold font-headline text-tertiary-container bg-tertiary-container/10 rounded-full px-2 py-0.5 animate-pulse">
          LIVE
        </span>
      </div>

      {/* Price rows */}
      <div className="flex flex-col gap-2 flex-1">
        {DEMO_PRICES.map(({ store, icon: Icon, color, price, original }) => {
          const discount = Math.round((1 - price / original) * 100);
          const isBest = store === best.store;
          return (
            <div
              key={store}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                isBest
                  ? 'bg-primary-container/10 border border-primary-container/20'
                  : 'bg-surface-container-high/60',
              )}
            >
              <Icon style={{ color }} className="h-4 w-4 shrink-0" aria-label={store} />
              <span className="text-sm font-body text-on-surface-variant flex-1">{store}</span>
              {discount > 0 && (
                <span className="text-[10px] font-semibold font-headline rounded-full px-1.5 py-0.5"
                  style={{ background: 'rgba(94,186,94,0.15)', color: '#7ecfb1' }}>
                  -{discount}%
                </span>
              )}
              <span className={cn(
                'text-sm font-headline font-bold tabular-nums',
                isBest ? 'text-primary-container' : 'text-on-surface',
              )}>
                ${price.toFixed(2)}
              </span>
              {isBest && (
                <span className="text-[10px] font-semibold font-headline text-primary-container">
                  ★ Best
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-on-surface-variant/50 font-body">
        Prices scraped in real-time · Never stale
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 2 — Your Game Journal (tall, covers)
// ---------------------------------------------------------------------------

const JOURNAL_COVERS = [
  { appid: 1245620, title: 'Elden Ring' },
  { appid: 1091500, title: 'Cyberpunk 2077' },
  { appid: 1086940, title: "Baldur's Gate 3" },
];

function JournalCell() {
  return (
    <div className="relative flex flex-col h-full p-6 gap-4 overflow-hidden">
      {/* Ambient warm blob */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #9b7ec8 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-secondary-container" aria-hidden="true" />
        <h3 className="font-headline font-semibold text-base text-on-surface">
          Your Game Journal
        </h3>
      </div>

      {/* Stacked tilted covers */}
      <div className="relative flex-1 flex items-center justify-center">
        {JOURNAL_COVERS.map(({ appid, title }, i) => {
          const rotations = [-6, 2, 8];
          const offsets = ['-translate-x-8', 'translate-x-0', 'translate-x-8'];
          const zIndexes = [10, 20, 30];
          return (
            <div
              key={appid}
              className={cn(
                'absolute w-28 shadow-ambient-lg rounded-xl overflow-hidden',
                offsets[i],
              )}
              style={{
                transform: `rotate(${rotations[i]}deg) translateX(${(i - 1) * 28}px)`,
                zIndex: zIndexes[i],
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}
              aria-label={title}
            >
              <div className="aspect-[3/4] relative bg-surface-container-low">
                <Image
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`}
                  alt={title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-sm text-on-surface font-headline font-semibold">Save & track deals</p>
        <p className="text-xs text-on-surface-variant/60 font-body mt-0.5">
          Wishlist your favorites — get alerted when prices drop.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 3 — Price History spark
// ---------------------------------------------------------------------------

// Toy SVG sparkline — 7 data points
const SPARK = [59.99, 54.99, 49.99, 44.99, 39.99, 35.99, 29.99];

function HistoryCell() {
  const min = Math.min(...SPARK);
  const max = Math.max(...SPARK);
  const w = 240;
  const h = 60;
  const points = SPARK.map((v, i) => {
    const x = (i / (SPARK.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-tertiary-container" aria-hidden="true" />
        <h3 className="font-headline font-semibold text-base text-on-surface">
          Price History
        </h3>
      </div>

      {/* Sparkline */}
      <div className="flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full"
          aria-label="Price trend chart showing decreasing price over time"
          role="img"
        >
          <defs>
            <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff9a5d" />
              <stop offset="100%" stopColor="#9b7ec8" />
            </linearGradient>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9a5d" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ff9a5d" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Fill */}
          <polygon
            points={`0,${h} ${points} ${w},${h}`}
            fill="url(#spark-fill)"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#spark-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Current price dot */}
          {(() => {
            const last = SPARK[SPARK.length - 1];
            const x = w;
            const y = h - ((last - min) / (max - min)) * h * 0.8 - h * 0.1;
            return (
              <circle cx={x} cy={y} r="4" fill="#ff9a5d" stroke="#140c0c" strokeWidth="2" />
            );
          })()}
        </svg>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-on-surface-variant/50 font-body">All-time low</p>
          <p className="font-headline font-bold text-xl text-primary-container">
            ${min.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-on-surface-variant/40 font-body">90-day chart</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell 4 — 4 Stores Covered
// ---------------------------------------------------------------------------

const STORES = [
  { name: 'Steam',      icon: SiSteam,     color: '#4a8dca' },
  { name: 'Epic Games', icon: SiEpicgames, color: '#e8e8e8' },
  { name: 'GOG',        icon: SiGogdotcom,       color: '#b95fe1' },
  { name: 'Xbox',       icon: XboxIcon,      color: '#5fba5f' },
];

function StoresCoveredCell() {
  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <h3 className="font-headline font-semibold text-base text-on-surface">
        4 Stores. One Search.
      </h3>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {STORES.map(({ name, icon: Icon, color }) => (
          <div
            key={name}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-high/60 p-3"
          >
            <Icon
              style={{ color }}
              className="h-7 w-7"
              aria-label={name}
            />
            <span className="text-[11px] font-body text-on-surface-variant/70 text-center leading-tight">
              {name}
            </span>
            <span
              className="text-[9px] font-headline font-semibold rounded-full px-2 py-0.5"
              style={{ background: `${color}18`, color }}
            >
              LIVE
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function BentoFeatures() {
  return (
    <section className="py-20 bg-surface-container-lowest/60">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-3">
            Your gaming sanctuary.
          </h2>
          <p className="text-base text-on-surface-variant font-body max-w-lg mx-auto leading-relaxed">
            More than a price tracker — a place to take control of your gaming library
            and always get the best deal.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
          {/* Cell 1: Live Price Intelligence — wide */}
          <BentoCell className="lg:col-span-2">
            <PriceIntelligenceCell />
          </BentoCell>

          {/* Cell 2: Journal — tall */}
          <BentoCell className="sm:row-span-2">
            <JournalCell />
          </BentoCell>

          {/* Cell 3: Price History */}
          <BentoCell>
            <HistoryCell />
          </BentoCell>

          {/* Cell 4: Stores */}
          <BentoCell>
            <StoresCoveredCell />
          </BentoCell>
        </div>
      </div>
    </section>
  );
}
