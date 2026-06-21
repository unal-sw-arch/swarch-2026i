import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-headline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        // Sunset orange — primary CTA
        default:
          'bg-primary-container text-primary-on-container font-semibold shadow-glow-primary hover:shadow-glow-primary-lg hover:bg-primary-dim active:scale-[0.97]',
        destructive:
          'bg-error-container text-on-surface hover:opacity-90',
        // Ghost outline — secondary actions
        outline:
          'border border-outline-variant/25 bg-transparent text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50',
        // Lavender secondary
        secondary:
          'bg-secondary-container/20 text-secondary-fixed-dim hover:bg-secondary-container/30',
        ghost:
          'bg-transparent text-on-surface hover:bg-surface-container-high',
        link:
          'text-primary-container underline-offset-4 hover:underline bg-transparent',
        // Sunset orange — primary CTA
        sunset:
          'btn-sunset text-on-surface font-semibold shadow-sunset hover:shadow-sunset-lg active:scale-[0.97]',
        tactical:
          'glass ghost-border text-on-surface hover:bg-surface-container-high active:scale-[0.97]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
