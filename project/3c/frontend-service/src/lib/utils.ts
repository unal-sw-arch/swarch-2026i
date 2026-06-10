import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names intelligently, resolving conflicts
 * via tailwind-merge and supporting conditional classes via clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price number to a locale currency string.
 * Defaults to USD. Pass null/undefined to return "Free".
 */
export function formatPrice(
  amount: number | null | undefined,
  currency = 'USD',
  locale = 'en-US',
): string {
  if (amount == null) return 'Free';
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Converts a game title to a URL-friendly slug.
 * e.g. "Elden Ring" → "elden-ring"
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns the store's display name from an internal store key.
 */
export function storeLabel(store: string): string {
  const labels: Record<string, string> = {
    steam: 'Steam',
    epic: 'Epic Games',
    gog: 'GOG',
    microsoft: 'Xbox / PC Game Pass',
  };
  return labels[store.toLowerCase()] ?? store;
}

/**
 * Calculates the discount percentage between original and sale price.
 * Returns null if no discount.
 */
export function discountPercent(
  original: number,
  sale: number,
): number | null {
  if (original <= 0 || sale >= original) return null;
  return Math.round(((original - sale) / original) * 100);
}
