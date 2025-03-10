import { Container } from '@mui/material';
import { ContainerProps } from '@mui/system';
import { ReactNode } from 'react';

import { ContextHeaderAppBar } from './dashboard/contextHeader/ContextHeader';
import Breadcrumbs, { Breadcrumb } from '@/components/elements/Breadcrumbs';

const BasicBreadcrumbPageLayout = ({
  crumbs,
  children,
  ContainerProps,
  maxWidth = 'lg',
}: {
  crumbs: Breadcrumb[];
  children: ReactNode;
  ContainerProps?: ContainerProps;
  maxWidth?: ContainerProps['maxWidth'];
}) => {
  return (
    <>
      <ContextHeaderAppBar>
        <Container maxWidth={maxWidth}>
          <Breadcrumbs crumbs={crumbs} />
        </Container>
      </ContextHeaderAppBar>
      <Container
        component='main'
        maxWidth={maxWidth}
        sx={{ pt: 2, pb: 6 }}
        {...ContainerProps}
      >
        {children}
      </Container>
    </>
  );
};
export default BasicBreadcrumbPageLayout;
