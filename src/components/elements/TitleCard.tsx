import { Paper, PaperProps, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  'data-testid'?: string;
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  sx,
  ...props
}) => (
  <Paper data-testid={props['data-testid']}>
    <Stack
      justifyContent={'space-between'}
      direction='row'
      sx={{
        px: 2,
        py: 2,
        alignItems: 'center',
        borderBottomColor: 'borders.light',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
      }}
    >
      <Typography variant='h5'>{title}</Typography>
      {actions}
    </Stack>

    {children}
  </Paper>
);

export default TitleCard;
