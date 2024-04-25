import { useCallback } from 'react';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
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
    render: 'projectName',
    linkTreatment: true,
    ariaLabel: (row) => row.projectName,
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

  const filters = useFilters({
    type: 'ProjectsForEnrollmentFilterOptions',
    omit: ['searchTerm'],
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
      noData='No projects'
      pagePath='organization.projects'
      showFilters={!hideFilters}
      filters={hideFilters ? undefined : filters}
      recordType='Project'
      defaultFilterValues={
        hideFilters ? undefined : { status: [ProjectFilterOptionStatus.Open] }
      }
      noSort
    />
  );
};
export default OrganizationProjectsTable;
