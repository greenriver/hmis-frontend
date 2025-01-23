import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { Dispatch, SetStateAction, useState } from 'react';

import CommonSearchInput from '../../search/components/CommonSearchInput';
import ButtonLink from '@/components/elements/ButtonLink';

import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageContainer from '@/components/layout/PageContainer';
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
    sticky: 'left',
  },
  {
    header: 'Organization Name',
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
  {
    ...BASE_ACTION_COLUMN_DEF,
    render: (project: ProjectAllFieldsFragment) => (
      <TableRowActions
        record={project}
        recordName={project.projectName}
        menuActionConfigs={[
          {
            title: 'View Project',
            ariaLabel: `View Project, ${project.projectName}`,
            key: 'project',
            to: generateSafePath(Routes.PROJECT, {
              projectId: project.id,
            }),
          },
        ]}
      />
    ),
  },
];

const ORGANIZATION_COLUMNS: ColumnDef<OrganizationType>[] = [
  {
    header: 'Organization Name',
    render: 'organizationName',
    sticky: 'left',
  },
  {
    header: 'Project Count',
    render: 'projects.nodesCount' as keyof OrganizationType,
  },
  {
    ...BASE_ACTION_COLUMN_DEF,
    render: (organization: OrganizationType) => (
      <TableRowActions
        record={organization}
        recordName={organization.organizationName}
        menuActionConfigs={[
          {
            title: 'View Organization',
            key: 'organization',
            ariaLabel: `View Organization, ${organization.organizationName}`,
            to: generateSafePath(Routes.ORGANIZATION, {
              organizationId: organization.id,
            }),
          },
        ]}
      />
    ),
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

const ProjectsTable = ({
  search,
  setSearch,
  debouncedSearch,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  debouncedSearch?: string;
}) => {
  const projectFilters = useFilters({
    type: 'ProjectFilterOptions',
    omit: ['searchTerm'],
  });

  return (
    <Stack gap={2}>
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
      <Paper data-testid='allProjectsTable'>
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
          rowLinkTo={(project) =>
            generateSafePath(Routes.PROJECT, {
              projectId: project.id,
            })
          }
          noData='No projects'
          pagePath='projects'
          recordType='Project'
          defaultFilterValues={{
            status: [ProjectFilterOptionStatus.Open],
          }}
          filters={projectFilters}
          defaultPageSize={25}
        />
      </Paper>
    </Stack>
  );
};
const OrganizationsTable = ({
  search,
  setSearch,
  debouncedSearch,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  debouncedSearch?: string;
}) => {
  const isMobile = useIsMobile('sm');

  return (
    <Stack gap={2}>
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
      <Paper>
        <GenericTableWithData<
          GetOrganizationsQuery,
          GetOrganizationsQueryVariables,
          OrganizationType
        >
          key='organizationTable'
          queryDocument={GetOrganizationsDocument}
          columns={ORGANIZATION_COLUMNS}
          rowLinkTo={(organization) =>
            generateSafePath(Routes.ORGANIZATION, {
              organizationId: organization.id,
            })
          }
          noData='No organizations'
          pagePath='organizations'
          recordType='Organization'
          defaultPageSize={25}
          queryVariables={{
            filters: { searchTerm: debouncedSearch || undefined },
          }}
          noSort
        />
      </Paper>
    </Stack>
  );
};

const AllProjectsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

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
      {viewMode === 'projects' ? (
        <ProjectsTable
          debouncedSearch={debouncedSearch}
          search={search}
          setSearch={setSearch}
        />
      ) : (
        <OrganizationsTable
          debouncedSearch={debouncedSearch}
          search={search}
          setSearch={setSearch}
        />
      )}
    </PageContainer>
  );
};
export default AllProjectsPage;
