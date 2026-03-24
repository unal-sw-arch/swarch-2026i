import * as React from 'react';
import MuiAvatar from '@mui/material/Avatar';

function Avatar({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <MuiAvatar className={className} sx={{ backgroundColor: 'transparent', p: 0 }} {...props}>
      {children}
    </MuiAvatar>
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  return <img className={className} {...props} />;
}

function AvatarFallback({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center ${className ?? ''}`} {...props}>
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
