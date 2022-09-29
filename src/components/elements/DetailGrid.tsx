import { Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Item {
  label: string;
  value: ReactNode;
}

const DetailGrid = ({ data }: { data: Item[] }) => {
  return (
    <>
      {data.map(({ label, value }) => (
        <Grid item xs={4} key={label}>
          <Stack>
            <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
              {label}
            </Typography>
            <Typography variant='subtitle2'>{value}</Typography>
          </Stack>
        </Grid>
      ))}
    </>
  );
};

export default DetailGrid;
