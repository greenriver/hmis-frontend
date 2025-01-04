import { Grid } from '@mui/material';
import { ReactNode } from 'react';

export interface DynamicFormLayoutProps {
  errors?: ReactNode;
  children: ReactNode;
  saveButtons?: ReactNode;
  variant?: 'standard' | 'without_top_level_cards';
}

const DynamicFormLayout = ({
  errors,
  children,
  saveButtons,
  variant = 'standard',
}: DynamicFormLayoutProps) => {
  return (
    <>
      <Grid
        container
        direction='column'
        spacing={2}
        sx={
          variant === 'without_top_level_cards'
            ? { '.HmisForm-card': { px: 0, pt: 1, pb: 0, border: 'unset' } }
            : undefined
        }
      >
        {errors && <Grid item>{errors}</Grid>}
        {children}
      </Grid>
      {saveButtons}
    </>
  );
};

export default DynamicFormLayout;
