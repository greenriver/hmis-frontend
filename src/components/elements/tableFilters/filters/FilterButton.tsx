import { Button, ButtonProps, alpha } from '@mui/material';
import React from 'react';

export interface TableFilterButtonProps extends ButtonProps {
  active?: boolean;
}

const TableFilterButton: React.FC<TableFilterButtonProps> = ({
  active = false,
  ...props
}) => {
  return (
    <Button
      size='small'
      color='secondary'
      variant='text'
      sx={(theme) => ({
        color: active
          ? theme.palette.secondary.main
          : theme.palette.text.secondary,
        fontWeight: 600,
        backgroundColor: active
          ? alpha(theme.palette.secondary.main, 0.05)
          : undefined,
        '&:hover': {
          backgroundColor: active
            ? alpha(theme.palette.secondary.main, 0.15)
            : undefined,
        },
        px: 2,
      })}
      {...props}
    />
  );
};

export default TableFilterButton;
