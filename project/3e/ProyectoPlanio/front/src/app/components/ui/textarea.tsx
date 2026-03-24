import * as React from 'react';
import TextField from '@mui/material/TextField';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <TextField
      multiline
      minRows={4}
      fullWidth
      size="small"
      className={className}
      {...(props as unknown as React.ComponentProps<typeof TextField>)}
    />
  );
}

export { Textarea };
