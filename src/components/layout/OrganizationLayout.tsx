import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';

import Breadcrumbs, { Breadcrumb } from '@/components/elements/Breadcrumbs';

export const PROJECT_CONTEXT_HEADER_HEIGHT = 48;

const OrganizationLayout = ({
  crumbs,
  children,
}: {
  crumbs?: Breadcrumb[];
  children: ReactNode;
}) => {
  return (
    <Container maxWidth='lg' sx={{ pt: 2, pb: 6 }}>
      {crumbs && (
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs crumbs={crumbs} />
        </Box>
      )}
      {children}
    </Container>
  );
};
export default OrganizationLayout;
