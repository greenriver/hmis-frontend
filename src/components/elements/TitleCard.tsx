import { Paper, PaperProps, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  headerVariant?: 'border';
  'data-testid'?: string;
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  headerVariant,
  ...props
}) => (
  <Paper data-testid={props['data-testid']} {...props}>
    <Stack
      justifyContent={'space-between'}
      direction='row'
      sx={{
        px: 2,
        py: 2,
        //alignItems: 'center',
        ...(headerVariant === 'border'
          ? {
              borderBottomColor: 'borders.light',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }
          : {}),
      }}
    >
      <Typography variant='h5'>{title}</Typography>
      {actions}
    </Stack>

    {children}
  </Paper>
);

export default TitleCard;
