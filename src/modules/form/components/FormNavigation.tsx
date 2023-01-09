import { Grid, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import FormStepper from '@/modules/form/components/FormStepper';
import { FormItem } from '@/types/gqlTypes';

export interface FormNavigationProps {
  items: FormItem[];
  children: ReactNode;
  top?: string;
}
const FormNavigation = ({ items, children }: FormNavigationProps) => (
  <>
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <Paper
        sx={{
          p: 3,
          position: 'sticky',
          top: STICKY_BAR_HEIGHT + 16,
        }}
      >
        <Typography variant='h6' sx={{ mb: 2 }}>
          Form Navigation
        </Typography>
        <FormStepper items={items} />
      </Paper>
    </Grid>
    <Grid item xs={9} sx={{ pt: '0 !important' }}>
      {children}
    </Grid>
  </>
);
export default FormNavigation;
