import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/GenericTable';
import TextInput from '@/components/elements/input/TextInput';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetOrganizationWithPaginatedProjectsDocument,
  GetOrganizationWithPaginatedProjectsQuery,
  GetOrganizationWithPaginatedProjectsQueryVariables,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ProjectAllFieldsFragment>[] = [
  {
    header: 'Name',
    render: 'projectName',
    linkTreatment: true,
  },
  {
    header: 'Type',
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

const ProjectsTable = ({
  organizationId,
  hideSearch = false,
}: {
  organizationId: string;
  hideSearch?: boolean;
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
      GetOrganizationWithPaginatedProjectsQuery,
      GetOrganizationWithPaginatedProjectsQueryVariables,
      ProjectAllFieldsFragment
    >
      header={
        !hideSearch && (
          <TextInput
            name='search projects'
            placeholder='Search...'
            value={search || null}
            onChange={(e) => setSearch(e.target.value)}
            inputWidth='200px'
          />
        )
      }
      queryVariables={{ id: organizationId, searchTerm: debouncedSearch }}
      queryDocument={GetOrganizationWithPaginatedProjectsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No projects.'
      pagePath='organization.projects'
    />
  );
};
export default ProjectsTable;
