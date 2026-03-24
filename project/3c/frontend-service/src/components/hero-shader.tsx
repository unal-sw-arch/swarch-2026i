'use client';

/**
 * HeroShader — client-side dynamic import wrapper for ShaderBackground.
 * Required because `next/dynamic` with `ssr: false` cannot be used in
 * Server Components — it must live in a 'use client' module.
 */

import dynamic from 'next/dynamic';

export const HeroShader = dynamic(
  () => import('@/components/ui/shader-background').then((m) => m.ShaderBackground),
  { ssr: false },
);
