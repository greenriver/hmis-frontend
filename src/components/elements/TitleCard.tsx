import {
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
  headerTypographyVariant?: TypographyVariant;
  'data-testid'?: string;
  headerSx?: SxProps;
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  headerTypographyVariant = 'h5',
  headerVariant,
  headerSx,
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

    {children}
  </Paper>
);

export default TitleCard;
