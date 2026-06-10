'use client';

/**
 * CardSpotlight — mouse-tracking radial gradient spotlight on hover.
 *
 * Sourced from: https://21st.dev/aceternity/card-spotlight
 * Adapted: warm sanctuary colors, no CanvasRevealEffect dependency,
 *          configurable spotlight color, sanctuary border radius.
 *
 * Usage:
 *   <CardSpotlight className="...">
 *     content
 *   </CardSpotlight>
 */

import React, { useRef, useState, type MouseEvent } from 'react';
import { useMotionValue, motion, useMotionTemplate } from 'motion/react';
import { cn } from '@/lib/utils';

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius of the spotlight in px */
  radius?: number;
  /** Spotlight color — defaults to warm sunset tint */
  color?: string;
  children: React.ReactNode;
}

export function CardSpotlight({
  children,
  radius = 280,
  color = 'rgba(255, 154, 93, 0.10)',
  className,
  ...props
}: CardSpotlightProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightMask = useMotionTemplate`
    radial-gradient(
      ${radius}px circle at ${mouseX}px ${mouseY}px,
      white,
      transparent 80%
    )
  `;

  return (
    <div
      className={cn(
        'group/spotlight relative overflow-hidden rounded-2xl bg-surface-container',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {/* Spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: color,
          WebkitMaskImage: spotlightMask,
          maskImage: spotlightMask,
        }}
      />

      {/* Warm border glow on hover */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          style={{
            boxShadow: `0 0 0 1px rgba(255, 154, 93, 0.15), 0 8px 30px rgba(255, 154, 93, 0.08)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
