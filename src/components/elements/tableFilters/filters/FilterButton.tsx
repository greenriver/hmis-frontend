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
      color='primary'
      variant='text'
      sx={(theme) => ({
        color: active ? theme.palette.primary.main : theme.palette.text.primary,
        fontWeight: 600,
        '&:hover': {
          backgroundColor: active
            ? alpha(theme.palette.primary.main, 0.15)
            : theme.palette.grey[100],
        },
        px: 2,
        py: 1,
      })}
      {...props}
    />
  );
};

export default TableFilterButton;
