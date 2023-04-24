import { Box, Grid, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { STICKY_BAR_HEIGHT } from '@/components/layout/layoutConstants';
import FormStepper from '@/modules/form/components/FormStepper';
import { FormItem } from '@/types/gqlTypes';

export interface FormNavigationProps {
  items: FormItem[];
  children: ReactNode;
  top?: number;
  contentsBelowNavigation?: ReactNode;
  title?: string | null;
}
const FormNavigation = ({
  items,
  children,
  title = 'Form Navigation',
  top = STICKY_BAR_HEIGHT,
  contentsBelowNavigation,
}: FormNavigationProps) => (
  <>
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <Box
        sx={{
          position: 'sticky',
          top: top + 16,
        }}
      >
        <Paper sx={{ p: 2 }}>
          {title && (
            <Typography variant='h6' sx={{ mb: 2 }}>
              {title}
            </Typography>
          )}
          <FormStepper items={items} />
        </Paper>
        {contentsBelowNavigation}
      </Box>
    </Grid>
    <Grid item xs={9} sx={{ pt: '0 !important' }}>
      {children}
    </Grid>
  </>
);
export default FormNavigation;
