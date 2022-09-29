import { Container, Grid, Typography } from '@mui/material';

import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import GroupedProjectTable from '@/modules/inventory/components/GroupedProjectTable';
import { useGetOrganizationsAndProjectsQuery } from '@/types/gqlTypes';

const AllProjects = () => {
  const { data, loading, error } = useGetOrganizationsAndProjectsQuery();

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Grid container>
          <Grid item xs={10}>
            {data?.organizations && (
              <GroupedProjectTable organizations={data?.organizations} />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default AllProjects;
