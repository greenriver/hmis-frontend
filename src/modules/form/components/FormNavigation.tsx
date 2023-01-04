import { Grid, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

import FormStepper from '@/modules/form/components/FormStepper';
import { FormItem } from '@/types/gqlTypes';

export interface FormNavigationProps {
  items: FormItem[];
  children: ReactNode;
  top?: string;
}
const FormNavigation = ({ items, children, top }: FormNavigationProps) => (
  <>
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <Paper
        sx={{
          p: 3,
          position: 'sticky',
          top: top || '86px', // hacky way to line up with top of form contents
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
