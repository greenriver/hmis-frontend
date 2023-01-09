import { Box, Container, Typography } from '@mui/material';
import { ReactNode } from 'react';

import Breadcrumbs, { Breadcrumb } from '@/components/elements/Breadcrumbs';
import PageHeader from '@/components/layout/PageHeader';

export const PROJECT_CONTEXT_HEADER_HEIGHT = 48;

const ProjectLayout = ({
  crumbs,
  children,
}: {
  crumbs?: Breadcrumb[];
  children: ReactNode;
}) => {
  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      {/* {crumbs && (
        <AppBar
          position='sticky'
          color='default'
          elevation={0}
          sx={{
            borderTop: 'unset',
            borderLeft: 'unset',
            height: PROJECT_CONTEXT_HEADER_HEIGHT,
            alignItems: 'stretch',
            justifyContent: 'center',
            top: STICKY_BAR_HEIGHT,
            backgroundColor: 'white',
            borderBottomWidth: '1px',
            borderBottomColor: 'borders.light',
            borderBottomStyle: 'solid',
            py: 0,
            px: { sm: 2, lg: 3 },
          }}
        >
          <Breadcrumbs crumbs={crumbs} />
        </AppBar>
      )} */}
      <Container maxWidth='lg' sx={{ pt: 2, pb: 6 }}>
        {crumbs && (
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs crumbs={crumbs} />
          </Box>
        )}

        {children}
      </Container>
    </>
  );
};
export default ProjectLayout;
