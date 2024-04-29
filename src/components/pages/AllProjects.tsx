import AddIcon from '@mui/icons-material/Add';
import { Grid, Paper } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useCallback, useState } from 'react';

import CommonSearchInput from '../../modules/search/components/CommonSearchInput';
import ButtonLink from '../elements/ButtonLink';

import CommonToggle, { ToggleItem } from '../elements/CommonToggle';
import PageContainer from '../layout/PageContainer';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import { useIsMobile } from '@/hooks/useIsMobile';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import {
  GetOrganizationsDocument,
  GetOrganizationsQuery,
  GetOrganizationsQueryVariables,
  GetProjectsDocument,
  GetProjectsQuery,
  GetProjectsQueryVariables,
  ProjectAllFieldsFragment,
  ProjectFilterOptionStatus,
  ProjectSortOption,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type OrganizationType = NonNullable<
  NonNullable<GetOrganizationsQuery['organizations']>['nodes']
>[0];

const PROJECT_COLUMNS: ColumnDef<ProjectAllFieldsFragment>[] = [
  {
    header: 'Project Name',
    render: 'projectName',
    linkTreatment: true,
    ariaLabel: (row) => row.projectName,
  },
  {
    header: 'Organization',
    render: (row) => row.organization.organizationName,
  },
  {
    header: 'Project Type',
    render: (project: ProjectAllFieldsFragment) => (
      <ProjectTypeChip projectType={project.projectType} />
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

const ORGANIZATION_COLUMNS: ColumnDef<OrganizationType>[] = [
  {
    header: 'Organization Name',
    render: 'organizationName',
    linkTreatment: true,
  },
  {
    header: 'Project Count',
    render: 'projects.nodesCount' as keyof OrganizationType,
  },
];

export type ViewMode = 'projects' | 'organizations';
const toggleItemDefinitions: ToggleItem<ViewMode>[] = [
  {
    value: 'projects',
    label: 'View Projects',
    testId: 'viewProjectsButton',
  },
  {
    value: 'organizations',
    label: 'View Organizations',
    testId: 'viewOrganizationsButton',
  },
];

const AllProjects = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');

  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  const projectRowLink = useCallback(
    (project: ProjectAllFieldsFragment) =>
      generateSafePath(Routes.PROJECT, {
        projectId: project.id,
      }),
    []
  );

  const projectFilters = useFilters({
    type: 'ProjectFilterOptions',
    omit: ['searchTerm'],
  });

  const organizationRowLink = useCallback(
    (row: OrganizationType) =>
      generateSafePath(Routes.ORGANIZATION, {
        organizationId: row.id,
      }),
    []
  );

  const isMobile = useIsMobile('sm');

  return (
    <PageContainer
      title={viewMode === 'projects' ? 'Projects' : 'Organizations'}
      actions={
        <CommonToggle
          value={viewMode}
          onChange={setViewMode}
          items={toggleItemDefinitions}
        />
      }
    >
      <Grid container spacing={2}>
        {viewMode === 'projects' && (
          <Grid item xs={12}>
            <CommonSearchInput
              label='Search Projects'
              name='search projects'
              placeholder='Search by Project Name or ID'
              value={search}
              onChange={setSearch}
              fullWidth
              size='medium'
              searchAdornment
              clearAdornment
            />
          </Grid>
        )}
        {viewMode === 'organizations' && (
          <Grid item xs={12}>
            <Stack gap={2} direction={isMobile ? 'column' : 'row'}>
              <CommonSearchInput
                label='Search Organizations'
                name='search organizations'
                placeholder='Search by Organization Name or ID'
                value={search}
                onChange={setSearch}
                fullWidth
                size='medium'
                searchAdornment
                clearAdornment
              />
              <RootPermissionsFilter permissions={['canEditOrganization']}>
                <Box
                  sx={{
                    width: 'fit-content',
                    pt: isMobile ? 0 : 3.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ButtonLink
                    data-testid='addOrganizationButton'
                    to={generateSafePath(Routes.CREATE_ORGANIZATION)}
                    Icon={AddIcon}
                    leftAlign
                  >
                    Add Organization
                  </ButtonLink>
                </Box>
              </RootPermissionsFilter>
            </Stack>
          </Grid>
        )}
        <Grid item xs={12}>
          <Paper data-testid='allProjectsTable'>
            {viewMode === 'projects' ? (
              <GenericTableWithData<
                GetProjectsQuery,
                GetProjectsQueryVariables,
                ProjectAllFieldsFragment
              >
                key='projectTable'
                queryVariables={{
                  filters: { searchTerm: debouncedSearch || undefined },
                }}
                defaultSortOption={ProjectSortOption.OrganizationAndName}
                queryDocument={GetProjectsDocument}
                columns={PROJECT_COLUMNS}
                rowLinkTo={projectRowLink}
                noData='No projects'
                pagePath='projects'
                recordType='Project'
                defaultFilterValues={{
                  status: [ProjectFilterOptionStatus.Open],
                }}
                filters={projectFilters}
                defaultPageSize={25}
              />
            ) : (
              <GenericTableWithData<
                GetOrganizationsQuery,
                GetOrganizationsQueryVariables,
                OrganizationType
              >
                key='organizationTable'
                queryDocument={GetOrganizationsDocument}
                columns={ORGANIZATION_COLUMNS}
                rowLinkTo={organizationRowLink}
                noData='No organizations'
                pagePath='organizations'
                recordType='Organization'
                defaultPageSize={25}
                queryVariables={{
                  filters: { searchTerm: debouncedSearch || undefined },
                }}
                noSort
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
export default AllProjects;
