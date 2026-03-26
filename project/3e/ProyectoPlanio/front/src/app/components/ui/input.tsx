import * as React from 'react';
import TextField from '@mui/material/TextField';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <TextField
      type={type}
      variant="outlined"
      size="small"
      fullWidth
      className={className}
      {...(props as unknown as React.ComponentProps<typeof TextField>)}
    />
  );
}

export { Input };
