import { Container, Typography } from '@mui/material';

import PageHeader from '../layout/PageHeader';

import GroupedProjectTable from '@/modules/inventory/components/GroupedProjectTable';

const AllProjects = () => {
  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <GroupedProjectTable />
      </Container>
    </>
  );
};
export default AllProjects;
