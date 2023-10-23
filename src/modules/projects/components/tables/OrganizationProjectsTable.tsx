import { omit } from 'lodash-es';
import { useCallback } from 'react';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
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
import generateSafePath from '@/utils/generateSafePath';

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
            inputWidth='300px'
          />
        )
      }
      queryVariables={{
        id: organizationId,
        filters: { searchTerm: debouncedSearch },
      }}
      queryDocument={GetOrganizationProjectsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No projects'
      pagePath='organization.projects'
      showFilters={!hideFilters}
      recordType='Project'
      filterInputType='ProjectsForEnrollmentFilterOptions'
      defaultFilters={
        hideFilters ? undefined : { status: [ProjectFilterOptionStatus.Open] }
      }
      filters={(filters) => omit(filters, 'searchTerm')}
      noSort
    />
  );
};
export default OrganizationProjectsTable;
