import { Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import SkipToContentButton from '@/components/elements/SkipToContentButton';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { useIsMobile } from '@/hooks/useIsMobile';
import FormStepper from '@/modules/form/components/FormStepper';
import { FormItem } from '@/types/gqlTypes';

export interface FormNavigationProps {
  navTitle?: string | null;
  navItems?: FormItem[];
  navScrollOffset?: number;
  contentsBelowNavigation?: ReactNode;
  useUrlHash?: boolean;
  children: ReactNode;
}
const FormNavigationContainer = ({
  navItems,
  navTitle = 'Form Navigation',
  navScrollOffset = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  contentsBelowNavigation,
  useUrlHash = true,
  children,
}: FormNavigationProps) => {
  const isTiny = useIsMobile('sm');
  const focusTargetId = 'focusable-form'; // This expects that only 1 form is rendered at a time.

  return (
    <Grid container spacing={4} sx={{ pb: 20, mt: 0 }}>
      {navItems && navItems.length > 0 && (
        <Grid
          item
          xs={12}
          sm={4}
          lg={2.5}
          sx={{
            pt: '0 !important',
            pb: 2,
          }}
        >
          <Paper
            sx={{
              p: 2,
              position: 'sticky',
              top: navScrollOffset + 16,
              maxHeight: isTiny
                ? undefined
                : `calc(100vh - ${navScrollOffset + 16 * 2}px)`,
              overflowY: 'auto',
            }}
          >
            <Stack gap={2}>
              <Typography variant='body2'>{navTitle}</Typography>
              <Divider sx={{ mx: -2 }} />
              <SkipToContentButton focusTargetId={focusTargetId}>
                Skip form navigation
              </SkipToContentButton>
              <FormStepper
                items={navItems}
                scrollOffset={navScrollOffset}
                useUrlHash={useUrlHash}
              />
              {contentsBelowNavigation && (
                <>
                  <Divider sx={{ mx: -2 }} />
                  {contentsBelowNavigation}
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      )}

      <Grid
        id={focusTargetId}
        item
        xs={12}
        sm={!!navItems ? 8 : 12}
        lg={!!navItems ? 9.5 : 12}
        sx={{
          pt: '0 !important',
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

export default FormNavigationContainer;
