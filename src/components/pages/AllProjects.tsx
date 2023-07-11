import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { omit } from 'lodash-es';
import { useCallback } from 'react';

import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectsDocument,
  GetProjectsQuery,
  GetProjectsQueryVariables,
  ProjectAllFieldsFragment,
  ProjectFilterOptionStatus,
  useGetAllOrganizationsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ProjectAllFieldsFragment>[] = [
  {
    header: 'Organization',
    render: (row) => (
      <Chip
        label={row.organization.organizationName}
        size='small'
        component='a'
        href={generateSafePath(Routes.ORGANIZATION, {
          organizationId: row.organization.id,
        })}
        icon={<OpenInNewIcon fontSize='inherit' />}
        clickable
        sx={{ px: 1 }}
      />
    ),
    linkTreatment: false,
    dontLink: true,
  },
  {
    header: 'Project Name',
    render: 'projectName',
    linkTreatment: true,
    ariaLabel: (row) => row.projectName,
  },
  {
    header: 'Project Type',
    render: (project: ProjectAllFieldsFragment) => (
      <HmisEnum value={project.projectType} enumMap={HmisEnums.ProjectType} />
    ),
  },
  {
    header: 'Operating Period',
    render: (project: ProjectAllFieldsFragment) =>
      parseAndFormatDateRange(
        project.operatingStartDate,
        project.operatingEndDate
      ),
  },
];

const AllProjects = () => {
  const { data, loading, error } = useGetAllOrganizationsQuery();

  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const rowLinkTo = useCallback(
    (project: ProjectAllFieldsFragment) =>
      generateSafePath(Routes.PROJECT, {
        projectId: project.id,
      }),
    []
  );

  if (loading && !data) return <Loading />;
  if (error) throw error;

  return (
    <Container maxWidth='lg' sx={{ pt: 2, pb: 6 }}>
      <Stack
        spacing={2}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mt: 2, mb: 4 }}
      >
        <Typography variant='h3'>Projects</Typography>
        <RootPermissionsFilter permissions={['canEditOrganization']}>
          <ButtonLink
            data-testid='addOrganizationButton'
            to={generateSafePath(Routes.CREATE_ORGANIZATION)}
            Icon={AddIcon}
            leftAlign
          >
            Add Organization
          </ButtonLink>
        </RootPermissionsFilter>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={6}>
          <TextInput
            label='Search Projects'
            name='search projects'
            placeholder='Search projects...'
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            inputWidth='100%'
          />
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <GenericTableWithData<
              GetProjectsQuery,
              GetProjectsQueryVariables,
              ProjectAllFieldsFragment
            >
              queryVariables={{
                filters: { searchTerm: debouncedSearch },
              }}
              queryDocument={GetProjectsDocument}
              columns={columns}
              rowLinkTo={rowLinkTo}
              noData='No projects'
              pagePath='projects'
              showFilters
              recordType='Project'
              defaultFilters={{ status: [ProjectFilterOptionStatus.Open] }}
              filters={(filters) => omit(filters, 'searchTerm')}
              defaultPageSize={25}
              noSort
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
export default AllProjects;
