import { CardProps, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface CommonCardProps {
  children: ReactNode;
  title?: ReactNode;
  sx?: CardProps['sx'];
}

// extracted from ViewCard
export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  children,
  sx,
}) => (
  <Paper
    sx={{
      py: 2,
      px: 2.5,
      pageBreakInside: 'avoid',
      ...sx,
    }}
  >
    {typeof title === 'string' ? (
      <Typography variant='h5' sx={{ mb: 2 }}>
        {title}
      </Typography>
    ) : (
      title
    )}

    {children}
  </Paper>
);
