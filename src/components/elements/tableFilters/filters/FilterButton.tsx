import { alpha, Button, ButtonProps, IconButton } from '@mui/material';
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface TableFilterButtonProps extends ButtonProps {
  active?: boolean;
}

const TableFilterButton: React.FC<TableFilterButtonProps> = ({
  active = false,
  startIcon,
  ...props
}) => {
  const isTiny = useIsMobile('sm');

  return isTiny ? (
    <IconButton
      sx={(theme) => ({
        border: `1px solid ${theme.palette.grayscale[300]}`,
        borderRadius: 1,
        height: '32px',
        width: '32px',
      })}
      {...props}
    >
      {startIcon}
    </IconButton>
  ) : (
    <Button
      size='small'
      variant='text'
      startIcon={startIcon}
      sx={(theme) => ({
        color: active ? theme.palette.links : theme.palette.text.primary,
        fontWeight: 600,
        '&:hover': {
          backgroundColor: active
            ? alpha(theme.palette.links, 0.15)
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
