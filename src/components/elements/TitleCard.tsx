import { Paper, PaperProps, Stack, SxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  headerVariant?: 'border';
  'data-testid'?: string;
  headerSx?: SxProps;
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  headerVariant,
  headerSx,
  ...props
}) => (
  <Paper data-testid={props['data-testid']} {...props}>
    <Stack
      justifyContent={'space-between'}
      direction='row'
      sx={{
        px: 2,
        py: 2,
        ...(headerVariant === 'border'
          ? {
              borderBottomColor: 'borders.light',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }
          : {}),
        ...headerSx,
      }}
    >
      <Typography variant='h5'>{title}</Typography>
      {actions}
    </Stack>

    {children}
  </Paper>
);

export default TitleCard;
