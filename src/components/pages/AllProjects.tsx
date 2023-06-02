import AddIcon from '@mui/icons-material/Add';
import { Container, Grid, Paper, Stack, Typography } from '@mui/material';

import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';

import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import GroupedProjectTable from '@/modules/projects/components/tables/GroupedProjectTable';
import { Routes } from '@/routes/routes';
import { useGetAllOrganizationsQuery } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const AllProjects = () => {
  const { data, loading, error } = useGetAllOrganizationsQuery();

  if (loading && !data) return <Loading />;
  if (error) throw error;

  const numOrganizations = data?.organizations?.nodesCount || 0;
  return (
    <Container maxWidth='lg' sx={{ pt: 2, pb: 6 }}>
      <Typography variant='h3' sx={{ mt: 2, mb: 4 }}>
        Organizations
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          {numOrganizations > 0 ? (
            <GroupedProjectTable
              organizations={data?.organizations?.nodes || []}
            />
          ) : (
            <Typography>No organizations.</Typography>
          )}
        </Grid>
        <RootPermissionsFilter permissions={['canEditOrganization']}>
          <Grid item xs>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Actions</Typography>
                <ButtonLink
                  data-testid='addOrganizationButton'
                  to={generateSafePath(Routes.CREATE_ORGANIZATION)}
                  Icon={AddIcon}
                  leftAlign
                >
                  Add Organization
                </ButtonLink>
              </Stack>
            </Paper>
          </Grid>
        </RootPermissionsFilter>
      </Grid>
    </Container>
  );
};
export default AllProjects;
