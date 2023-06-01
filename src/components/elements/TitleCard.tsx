import { Paper, PaperProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  title?: string;
  children: ReactNode;
  'data-testid'?: string;
}
const TitleCard: React.FC<Props> = ({ title, children, sx, ...props }) => (
  <Paper sx={{ pt: 2, mb: 2, ...sx }} data-testid={props['data-testid']}>
    {title && (
      <Typography variant='h5' sx={{ mx: 2, mb: 2 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

export default TitleCard;
