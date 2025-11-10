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
        '> .CommonDetailGridLabel:nth-last-of-type(2)': {
          border: 'unset',
        },
        '> .CommonDetailGridValue:nth-last-of-type(1)': {
          border: 'unset',
        },
      }}
    >
      {children}
    </Grid>
  );
};

export const CommonDetailGridItem: React.FC<{
  label: string | ReactNode | null; // if null, children take up full width
  children: ReactNode;
  sx?: SxProps;
  fullWidth?: boolean;
}> = ({ label, children, sx = {} }) => {
  const labelId = useId();
  const itemSx = {
    py: 1.5,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    ...sx,
  };

  const fullWidth = label === null;
  const valueBreakPoints = fullWidth
    ? { xs: 12 }
    : {
        xs: 12,
        md: 8,
        lg: 7,
        xl: 8,
      };

  return (
    <>
      {!fullWidth && (
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
      )}
      <Grid
        key='value'
        className='CommonDetailGridValue'
        item
        {...valueBreakPoints}
        sx={itemSx}
      >
        <Typography variant='body2' component='div' sx={{ width: '100%' }}>
          {children}
        </Typography>
      </Grid>
    </>
  );
};

export type CommonDetailGridItemRow = {
  id: string;
  label: ReactNode | null; // if null, value will take up full width
  value: ReactNode;
};
interface Props {
  rows: CommonDetailGridItemRow[];
}
const CommonDetailGrid: React.FC<Props> = ({ rows }) => (
  <CommonDetailGridContainer>
    {rows.map(({ id, label, value }) => (
      <CommonDetailGridItem label={label} key={id}>
        {value}
      </CommonDetailGridItem>
    ))}
  </CommonDetailGridContainer>
);
export default CommonDetailGrid;
