import { Grid, Typography } from '@mui/material';

import { SxProps } from '@mui/system';
import React, { ReactNode, useId } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

// Grid of Key/Value pairs that has the specific styling used for Enrollment Details and custom client attributes

export const CommonDetailGridContainer: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const isTiny = useIsMobile('md');

  return (
    <Grid
      container
      rowGap={0}
      sx={{
        '> .MuiGrid-item': {
          borderBottomColor: 'borders.light',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
        },
        '> .CommonDetailGridLabel': isTiny
          ? {
              borderBottom: 'unset',
              paddingBottom: 0,
            }
          : {},
        '> .CommonDetailGridLabel:first-of-type': isTiny
          ? {
              borderTopColor: 'borders.light',
              borderTopWidth: 1,
              borderTopStyle: 'solid',
            }
          : {},
        '> .MuiGrid-item:nth-last-of-type(2)': {
          border: 'unset',
        },
        '> .MuiGrid-item:nth-last-of-type(1)': {
          border: 'unset',
        },
      }}
    >
      {children}
    </Grid>
  );
};

export const CommonDetailGridItem: React.FC<{
  label: string | ReactNode;
  children: ReactNode;
  sx?: SxProps;
}> = ({ label, children, sx = {} }) => {
  const labelId = useId();
  const itemSx = {
    py: 1.5,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    ...sx,
  };

  return (
    <>
      <Grid
        key='label'
        className='CommonDetailGridLabel'
        id={labelId}
        item
        xs={12}
        md={4}
        lg={5}
        xl={4}
        sx={itemSx}
      >
        <Typography fontWeight={600} variant='body2'>
          {label}
        </Typography>
      </Grid>
      <Grid
        key='value'
        item
        xs={12}
        md={8}
        lg={7}
        xl={8}
        sx={itemSx}
        aria-labelledby={labelId}
      >
        <Typography variant='body2' component='div' sx={{ width: '100%' }}>
          {children}
        </Typography>
      </Grid>
    </>
  );
};
