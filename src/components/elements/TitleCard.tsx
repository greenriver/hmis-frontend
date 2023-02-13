import { Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

const TitleCard = ({
  title,
  children,
  ...props
}: {
  title?: string;
  children: ReactNode;
  'data-testid'?: string;
}) => (
  <Paper sx={{ pt: 2, mb: 2 }} data-testid={props['data-testid']}>
    {title && (
      <Typography variant='h5' sx={{ mx: 2, mb: 2 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

export default TitleCard;
