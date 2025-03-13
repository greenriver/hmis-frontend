import { Button, ButtonProps, IconButton } from '@mui/material';
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
        border: `1px solid ${theme.palette.borders.dark}`,
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
      variant='outlined'
      color={active ? 'primary' : 'grayscale'}
      startIcon={startIcon}
      sx={{
        backgroundColor: active ? 'primary.200' : undefined,
        px: 2,
        py: 1,
      }}
      {...props}
    />
  );
};

export default TableFilterButton;
