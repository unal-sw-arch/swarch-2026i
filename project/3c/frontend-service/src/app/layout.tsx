import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Lexend, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { RouteProgress } from '@/components/route-progress';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Fonts — Digital Sanctuary
// Lexend: rounded geometric for headlines (friendly + professional)
// Be Vietnam Pro: clean modern sans for body / long-form reading
// ---------------------------------------------------------------------------

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700', '800'],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
  weight: ['300', '400', '500', '600'],
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'GameSeeker — Find the Best Game Prices',
    template: '%s | GameSeeker',
  },
  description:
    'Compare game prices across Steam, Epic Games, GOG, and Xbox in real-time. Track your wishlist and never overpay.',
  keywords: [
    'game price comparison',
    'steam deals',
    'epic games sale',
    'gog prices',
    'xbox game deals',
    'cheapest games',
    'game wishlist',
  ],
  authors: [{ name: 'GameSeeker' }],
  creator: 'GameSeeker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gameseeker.app',
    siteName: 'GameSeeker',
    title: 'GameSeeker — Find the Best Game Prices',
    description:
      'Compare game prices across Steam, Epic Games, GOG, and Xbox in real-time.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameSeeker — Find the Best Game Prices',
    description: 'Compare game prices across Steam, Epic, GOG, and Xbox.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#140c0c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('dark', lexend.variable, beVietnamPro.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-on-surface antialiased">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>

        {/* Sanctuary depth — subtle warm/lavender ambient gradients */}
        <div
          className="pointer-events-none fixed inset-0 sanctuary-depth z-0"
          aria-hidden="true"
        />

        {/* Content layer */}
        <div className="relative z-10 flex min-h-dvh flex-col">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          <main className="flex-1">
            {children}
          </main>

          <footer className="mt-auto py-8">
            <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                &copy; {new Date().getFullYear()} GameSeeker. Prices scraped in
                real-time — verify at checkout.
              </p>
              <div className="flex items-center gap-6">
                {['Steam', 'Epic', 'GOG', 'Xbox'].map((store) => (
                  <span key={store} className="text-xs text-on-surface-variant/40 font-body">
                    {store}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
