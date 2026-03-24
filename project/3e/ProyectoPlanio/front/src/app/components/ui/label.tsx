import * as React from 'react';
import Typography from '@mui/material/Typography';

function Label({ className, children, ...props }: React.ComponentProps<'label'>) {
  return (
    <Typography component="label" variant="body2" className={className} {...props}>
      {children}
    </Typography>
  );
}

export { Label };
