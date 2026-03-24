import * as React from 'react';
import MuiButton from '@mui/material/Button';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild,
  children,
  ...props
}: ButtonProps) {
  const mappedVariant =
    variant === 'outline' ? 'outlined' : variant === 'link' || variant === 'ghost' ? 'text' : 'contained';
  const mappedColor =
    variant === 'destructive' ? 'error' : variant === 'secondary' ? 'secondary' : variant === 'ghost' || variant === 'link' ? 'inherit' : 'primary';
  const mappedSize = size === 'default' || size === 'icon' ? 'medium' : size;

  return (
    <MuiButton
      variant={mappedVariant}
      color={mappedColor}
      size={mappedSize}
      className={className}
      sx={
        variant === 'ghost'
          ? { boxShadow: 'none', backgroundColor: 'transparent', textTransform: 'none' }
          : variant === 'link'
            ? { p: 0, minWidth: 0, textTransform: 'none', textDecoration: 'underline' }
            : size === 'icon'
              ? { minWidth: 36, width: 36, height: 36, p: 0 }
              : undefined
      }
      {...props}
    >
      {children}
    </MuiButton>
  );
}

export { Button };
