import { Grid, GridProps } from '@mui/material';
import { ReactNode } from 'react';

export interface DynamicFormLayoutProps {
  errors?: ReactNode;
  children: ReactNode;
  saveButtons?: ReactNode;
  variant?: 'standard' | 'without_top_level_cards';
  GridProps?: GridProps;
}

const DynamicFormLayout = ({
  errors,
  children,
  saveButtons,
  variant = 'standard',
  GridProps,
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
        {...GridProps}
      >
        {errors && <Grid item>{errors}</Grid>}
        {children}
      </Grid>
      {saveButtons}
    </>
  );
};

export default DynamicFormLayout;
