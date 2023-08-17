import { CardProps, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface CommonCardProps {
  children: ReactNode;
  title?: ReactNode;
  sx?: CardProps['sx'];
  className?: string;
}

// extracted from ViewCard
export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  children,
  className,
  sx,
}) => (
  <Paper
    sx={{
      py: 2,
      px: 2.5,
      pageBreakInside: 'avoid',

      ...sx,
    }}
    className={className}
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
