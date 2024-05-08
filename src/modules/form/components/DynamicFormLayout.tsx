import { Grid } from '@mui/material';
import { ReactNode } from 'react';

export interface DynamicFormLayoutProps {
  errors?: ReactNode;
  children: ReactNode;
  saveButtons?: ReactNode;
}

const DynamicFormLayout = ({
  errors,
  children,
  saveButtons,
}: DynamicFormLayoutProps) => {
  return (
    <>
      <Grid container direction='column' spacing={2}>
        {errors && <Grid item>{errors}</Grid>}
        {children}
      </Grid>
      {saveButtons}
    </>
  );
};

export default DynamicFormLayout;
