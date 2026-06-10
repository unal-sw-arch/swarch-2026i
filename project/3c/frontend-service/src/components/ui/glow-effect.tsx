'use client';

/**
 * GlowEffect — animated conic/radial gradient border glow.
 *
 * Sourced from: https://21st.dev/ibelick/glow-effect
 * Adapted: warm Digital Sanctuary palette defaults.
 *
 * Usage — wrap any element:
 *   <div className="relative rounded-2xl">
 *     <GlowEffect colors={['#ff9a5d', '#9b7ec8']} mode="breathe" blur="strong" />
 *     <div className="relative z-10 ...">content</div>
 *   </div>
 */

import { cn } from '@/lib/utils';
import { motion, type Transition } from 'motion/react';

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  /** Gradient stop colors. Defaults to warm sanctuary palette. */
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'breathe' | 'colorShift' | 'flowHorizontal' | 'static';
  blur?: number | 'softest' | 'soft' | 'medium' | 'strong' | 'stronger' | 'strongest' | 'none';
  transition?: Transition;
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  // Default: sunset orange → lavender → mint — the sanctuary palette
  colors = ['#ff9a5d', '#f9873e', '#9b7ec8', '#7ecfb1', '#ff9a5d'],
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 6,
}: GlowEffectProps) {
  const BASE_TRANSITION: Transition = {
    repeat: Infinity,
    duration,
    ease: 'linear',
  };

  const animations: Record<string, object> = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`,
      ],
      transition: transition ?? BASE_TRANSITION,
    },
    pulse: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.4, 0.75, 0.4],
      transition: transition ?? { ...BASE_TRANSITION, repeatType: 'mirror' },
    },
    breathe: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.04 * scale, 1 * scale],
      transition: transition ?? { ...BASE_TRANSITION, repeatType: 'mirror' },
    },
    colorShift: {
      background: colors.map((color, i) => {
        const next = colors[(i + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${next} 50%, ${color} 100%)`;
      }),
      transition: transition ?? { ...BASE_TRANSITION, repeatType: 'mirror' },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const next = colors[(colors.indexOf(color) + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${next})`;
      }),
      transition: transition ?? { ...BASE_TRANSITION, repeatType: 'mirror' },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`,
    },
  };

  const blurClass = (() => {
    if (typeof blur === 'number') return `blur-[${blur}px]`;
    return {
      softest:  'blur-sm',
      soft:     'blur',
      medium:   'blur-md',
      strong:   'blur-lg',
      stronger: 'blur-xl',
      strongest:'blur-2xl',
      none:     'blur-none',
    }[blur] ?? 'blur-md';
  })();

  return (
    <motion.div
      style={{ ...style, '--scale': scale, willChange: 'transform', backfaceVisibility: 'hidden' } as React.CSSProperties}
      animate={animations[mode] as never}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        'scale-[var(--scale)] transform-gpu',
        blurClass,
        className,
      )}
    />
  );
}
