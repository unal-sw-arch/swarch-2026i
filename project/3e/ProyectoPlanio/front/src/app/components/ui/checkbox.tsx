import * as React from 'react';
import MuiCheckbox from '@mui/material/Checkbox';

interface CheckboxProps {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ className, checked, disabled, onCheckedChange }: CheckboxProps) {
  return (
    <MuiCheckbox
      className={className}
      checked={checked}
      disabled={disabled}
      onChange={(_, value) => onCheckedChange?.(value)}
      size="small"
    />
  );
}

export { Checkbox };
