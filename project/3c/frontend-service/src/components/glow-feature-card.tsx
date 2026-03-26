'use client';

/**
 * GlowFeatureCard — feature card with animated glow border from 21st.dev.
 * Client wrapper so GlowEffect (motion/react) works inside a server page.
 */

import React from 'react';
import { GlowEffect } from '@/components/ui/glow-effect';
import { cn } from '@/lib/utils';

interface GlowFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClassName?: string;
  className?: string;
}

export function GlowFeatureCard({
  icon,
  title,
  description,
  iconClassName,
  className,
}: GlowFeatureCardProps) {
  return (
    <div className={cn('relative rounded-2xl overflow-hidden group', className)}>
      {/* 21st.dev GlowEffect — breathe mode, warm sanctuary colors, only visible on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden">
        <GlowEffect
          colors={['#ff9a5d', '#9b7ec8', '#7ecfb1', '#f9873e']}
          mode="colorShift"
          blur="stronger"
          duration={4}
          scale={1.05}
        />
      </div>

      {/* Card surface — sits above glow, slightly inset so glow peeks around edges */}
      <div className="relative z-10 m-[1px] rounded-2xl bg-surface-container p-8 flex flex-col gap-4 transition-colors duration-300 group-hover:bg-surface-container-high overflow-hidden">
        {/* Warm halo behind icon on hover */}
        <div
          className="absolute -top-8 -left-8 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,154,93,0.10) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className={cn(
          'h-12 w-12 rounded-xl bg-surface-container-high flex items-center justify-center relative',
          iconClassName,
        )}>
          {icon}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-headline font-semibold text-lg text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed font-body">{description}</p>
        </div>
      </div>
    </div>
  );
}
