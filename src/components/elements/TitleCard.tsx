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
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props extends PaperProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  headerVariant?: 'border';
  headerTypographyVariant?: TypographyVariant | 'cardTitle';
  'data-testid'?: string;
  headerSx?: SxProps;
  padded?: boolean;
  stackOnMobile?: boolean;
  mobileBreakpoint?: 'xs' | 'sm' | 'md'; // breakpoint at which the actions will stack below the title
}
const TitleCard: React.FC<Props> = ({
  title,
  children,
  actions,
  headerTypographyVariant = 'cardTitle',
  headerVariant,
  headerSx,
  padded = false,
  stackOnMobile = true,
  mobileBreakpoint = 'xs',
  ...props
}) => {
  const isMobile = useIsMobile(mobileBreakpoint);

  return (
    <Paper data-testid={props['data-testid']} {...props}>
      <Stack
        justifyContent={'space-between'}
        alignItems={isMobile && stackOnMobile ? 'left' : 'center'}
        direction={isMobile && stackOnMobile ? 'column' : 'row'}
        spacing={{ xs: 1, md: 2, lg: 4 }}
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
          '& MuiButton-root': {
            width: 'fit-content',
          },
        }}
      >
        <Typography
          variant={headerTypographyVariant}
          sx={{ py: 1, flexGrow: 1 }}
        >
          {title}
        </Typography>
        {actions}
      </Stack>

      {padded ? <Box sx={{ px: 2, pb: 2 }}>{children}</Box> : children}
    </Paper>
  );
};

export default TitleCard;
