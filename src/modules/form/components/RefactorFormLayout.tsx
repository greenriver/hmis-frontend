import { Grid } from '@mui/material';
import { ReactNode } from 'react';

export interface RefactorFormLayoutProps {
  errors?: ReactNode;
  children: ReactNode;
  saveButtons?: ReactNode;
}

const RefactorFormLayout = ({
  errors,
  children,
  saveButtons,
}: RefactorFormLayoutProps) => {
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

export default RefactorFormLayout;
