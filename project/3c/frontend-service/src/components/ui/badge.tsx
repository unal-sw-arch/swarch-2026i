import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-headline transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary-container/15 text-primary-container border border-primary-container/20',
        secondary:
          'bg-secondary-container/15 text-secondary-fixed-dim border border-secondary-container/20',
        destructive:
          'bg-error-container/20 text-error border border-error/20',
        outline:
          'border border-outline-variant/25 text-on-surface-variant',
        // Sale / discount badge — mint green
        success:
          'bg-tertiary-container/15 text-tertiary-fixed-dim border border-tertiary-container/20',
        warning:
          'bg-primary-container/10 text-primary-container border border-primary-container/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
