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
  ProjectsForEnrollmentFilterOptions,
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

interface Props {
  organizationId: string;
}
const OrganizationProjectsTable: React.FC<Props> = ({ organizationId }) => {
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

  const { filters, filterValues, setFilterValues } =
    useTableFilters<ProjectsForEnrollmentFilterOptions>({
      type: 'ProjectsForEnrollmentFilterOptions',
      initialFilterValues: { status: [ProjectFilterOptionStatus.Open] },
    });

  return (
    <GenericTableWithData<
      GetOrganizationProjectsQuery,
      GetOrganizationProjectsQueryVariables,
      ProjectAllFieldsFragment
    >
      header={
        <TextInput
          label='Search Projects'
          name='search projects'
          placeholder='Search projects...'
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
          inputWidth={300}
        />
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
      filters={filters}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
      recordType='Project'
      noSort
    />
  );
};
export default OrganizationProjectsTable;
