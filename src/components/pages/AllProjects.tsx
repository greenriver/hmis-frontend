import AddIcon from '@mui/icons-material/Add';
import { Grid, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { omit } from 'lodash-es';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import ButtonLink from '../elements/ButtonLink';

import PageContainer from '../layout/PageContainer';
import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
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
import generateSafePath from '@/utils/generateSafePath';

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

interface ProjectOrgToggleProps {
  value: ViewMode;
  onChange: Dispatch<SetStateAction<ViewMode>>;
}
const ProjectOrgToggle: React.FC<ProjectOrgToggleProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, val: any) => {
      if (val) onChange(val as ViewMode);
    },
    [onChange]
  );
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label='view projects or organizations'
      size='small'
      sx={{
        '& .MuiToggleButtonGroup-grouped': {
          px: 2,
        },
      }}
    >
      <ToggleButton value='projects' aria-label='view projects'>
        View Projects
      </ToggleButton>
      <ToggleButton value='organizations' aria-label='view organizations'>
        View Organizations
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

const AllProjects = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');

  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const projectRowLink = useCallback(
    (project: ProjectAllFieldsFragment) =>
      generateSafePath(Routes.PROJECT, {
        projectId: project.id,
      }),
    []
  );

  const organizationRowLink = useCallback(
    (row: OrganizationType) =>
      generateSafePath(Routes.ORGANIZATION, {
        organizationId: row.id,
      }),
    []
  );

  return (
    <PageContainer
      title={viewMode == 'projects' ? 'Projects' : 'Organizations'}
      actions={<ProjectOrgToggle value={viewMode} onChange={setViewMode} />}
    >
      <Grid container spacing={2}>
        {viewMode == 'projects' && (
          <Grid item xs={12} md={8} lg={6}>
            <TextInput
              label='Search Projects'
              name='search projects'
              placeholder='Search by Project Name or ID'
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              inputWidth='100%'
            />
          </Grid>
        )}
        {viewMode == 'organizations' && (
          <RootPermissionsFilter permissions={['canEditOrganization']}>
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <ButtonLink
                data-testid='addOrganizationButton'
                to={generateSafePath(Routes.CREATE_ORGANIZATION)}
                Icon={AddIcon}
                leftAlign
              >
                Add Organization
              </ButtonLink>
            </Grid>
          </RootPermissionsFilter>
        )}
        <Grid item xs={12}>
          <Paper data-testid='allProjectsTable'>
            {viewMode == 'projects' ? (
              <GenericTableWithData<
                GetProjectsQuery,
                GetProjectsQueryVariables,
                ProjectAllFieldsFragment
              >
                queryVariables={{
                  filters: { searchTerm: debouncedSearch },
                }}
                defaultSortOption={ProjectSortOption.OrganizationAndName}
                queryDocument={GetProjectsDocument}
                columns={PROJECT_COLUMNS}
                rowLinkTo={projectRowLink}
                noData='No projects'
                pagePath='projects'
                showFilters
                recordType='Project'
                defaultFilters={{ status: [ProjectFilterOptionStatus.Open] }}
                filters={(filters) => omit(filters, 'searchTerm')}
                defaultPageSize={25}
              />
            ) : (
              <GenericTableWithData<
                GetOrganizationsQuery,
                GetOrganizationsQueryVariables,
                OrganizationType
              >
                queryDocument={GetOrganizationsDocument}
                columns={ORGANIZATION_COLUMNS}
                rowLinkTo={organizationRowLink}
                noData='No organizations'
                pagePath='organizations'
                showFilters
                recordType='Organization'
                defaultPageSize={25}
                queryVariables={{}}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
export default AllProjects;
