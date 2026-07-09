import { useCallback } from 'react';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import {
  GetOrganizationProjectsDocument,
  GetOrganizationProjectsQuery,
  GetOrganizationProjectsQueryVariables,
  ProjectAllFieldsFragment,
  ProjectFilterOptionStatus,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<ProjectAllFieldsFragment>[] = [
  {
    header: 'Project Name',
    key: 'projectName',
    render: 'projectName',
  },
  {
    header: 'Project Type',
    key: 'projectType',
    render: (project: ProjectAllFieldsFragment) => (
      <ProjectTypeChip projectType={project.projectType} />
    ),
  },
  {
    header: 'Operating Period',
    key: 'operatingPeriod',
    render: (project: ProjectAllFieldsFragment) =>
      parseAndFormatDateRange(
        project.operatingStartDate,
        project.operatingEndDate
      ),
  },
];

const OrganizationProjectsTable = ({
  organizationId,
  hideSearch = false,
  hideFilters = false,
}: {
  organizationId: string;
  hideSearch?: boolean;
  hideFilters?: boolean;
}) => {
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

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'ProjectsForEnrollmentFilterOptions',
    omit: ['searchTerm', 'ceWaitlistsEnabled'],
    initialFilterValues: { status: [ProjectFilterOptionStatus.Open] },
  });

  return (
    <GenericTableWithData<
      GetOrganizationProjectsQuery,
      GetOrganizationProjectsQueryVariables,
      ProjectAllFieldsFragment
    >
      header={
        !hideSearch && (
          <TextInput
            label='Search Projects'
            name='search projects'
            placeholder='Search projects...'
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            inputWidth={300}
          />
        )
      }
      queryVariables={{
        id: organizationId,
        filters: { searchTerm: debouncedSearch || undefined },
      }}
      queryDocument={GetOrganizationProjectsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      rowActionTitle='View Project'
      rowName={(row) => row.projectName}
      noData='No projects'
      pagePath='organization.projects'
      filters={hideFilters ? undefined : filters}
      filterValues={hideFilters ? undefined : filterValues}
      onFilterChange={hideFilters ? undefined : setFilterValues}
      recordType='Project'
      noSort
    />
  );
};
export default OrganizationProjectsTable;
