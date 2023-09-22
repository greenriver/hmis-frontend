import {
  Box,
  Paper,
  PaperProps,
  Stack,
  SxProps,
  Typography,
  TypographyVariant,
} from '@mui/material';
import { ReactNode } from 'react';

interface Props extends PaperProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  headerVariant?: 'border';
  headerTypographyVariant?: TypographyVariant | 'cardTitle';
  'data-testid'?: string;
  headerSx?: SxProps;
  withPadding?: boolean;
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  headerTypographyVariant = 'cardTitle',
  headerVariant,
  headerSx,
  withPadding = false,
  ...props
}) => (
  <Paper data-testid={props['data-testid']} {...props}>
    <Stack
      justifyContent={'space-between'}
      alignItems='center'
      direction='row'
      sx={{
        px: 2,
        py: actions ? 2 : 1,
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
      <Typography variant={headerTypographyVariant} sx={{ py: 1 }}>
        {title}
      </Typography>
      {actions}
    </Stack>

    {withPadding ? <Box sx={{ px: 2, pb: 2 }}>{children}</Box> : children}
  </Paper>
);

export default TitleCard;
