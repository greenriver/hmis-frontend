import { CardProps, Paper, Typography } from '@mui/material';
import { ElementType, ReactNode } from 'react';

interface CommonCardProps {
  children: ReactNode;
  title?: ReactNode;
  titleComponent?: ElementType<any>;
  sx?: CardProps['sx'];
  className?: string;
}

// extracted from ViewCard
export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  titleComponent,
  children,
  className,
  sx,
}) => {
  const titleTypographyProps = titleComponent
    ? { component: titleComponent }
    : {};

  return (
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
        <Typography variant='h5' sx={{ mb: 2 }} {...titleTypographyProps}>
          {title}
        </Typography>
      ) : (
        title
      )}

      {children}
    </Paper>
  );
};
