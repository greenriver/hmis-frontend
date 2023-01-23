import { Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

const TitleCard = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <Paper sx={{ pt: 2, mb: 2 }}>
    {title && (
      <Typography variant='h5' sx={{ mx: 2, mb: 2 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

export default TitleCard;
