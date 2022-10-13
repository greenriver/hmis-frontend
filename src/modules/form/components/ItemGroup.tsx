import { Box, Grid, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { Item } from '../types';

const ItemGroup = ({
  children,
  item,
  nestingLevel,
}: {
  children: ReactNode;
  item: Item;
  nestingLevel: number;
}) => {
  const direction = item.display?.direction ?? 'column';
  const isColumn = direction === 'column';
  const wrappedChildren = (
    <Grid
      container
      direction={direction}
      rowSpacing={isColumn ? 2 : 0}
      columnSpacing={isColumn ? 0 : 3}
      sx={{ '& .MuiGrid-item:first-of-type': { pt: 0 }, mt: 0 }}
    >
      {children}
    </Grid>
  );
  if (nestingLevel === 0) {
    return (
      <Grid item>
        <Paper
          sx={{
            py: 3,
            px: 2.5,
          }}
        >
          {item.text && (
            <Typography variant='h5' sx={{ mb: 3 }}>
              {item.text}
            </Typography>
          )}
          {wrappedChildren}
        </Paper>
      </Grid>
    );
  }
  if (nestingLevel === 1) {
    return (
      <Grid item xs>
        <Box sx={{ pl: 1, mb: 2 }}>
          <Box
            sx={{
              pl: 2,
              borderLeft: (theme) => `2px solid ${theme.palette.grey[400]}`,
            }}
          >
            {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
            {wrappedChildren}
          </Box>
        </Box>
      </Grid>
    );
  }
  return (
    <>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {wrappedChildren}
    </>
  );
};

export default ItemGroup;
