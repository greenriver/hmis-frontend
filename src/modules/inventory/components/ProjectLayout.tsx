import { Container, Typography } from '@mui/material';
import { ReactNode } from 'react';

import PageHeader from '@/components/layout/PageHeader';

const ProjectLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        {children}
      </Container>
    </>
  );
};
export default ProjectLayout;
