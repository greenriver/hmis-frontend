import { omit } from 'lodash-es';
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
    width: '45%',
    render: 'projectName',
    linkTreatment: true,
    ariaLabel: (row) => row.projectName,
  },
  {
    header: 'Project Type',
    width: '30%',
    render: (project: ProjectAllFieldsFragment) => (
      <HmisEnum value={project.projectType} enumMap={HmisEnums.ProjectType} />
    ),
  },
  {
    header: 'Operating Period',
    width: '25%',
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
            placeholder='Search...'
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            inputWidth='200px'
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
      noData='No projects.'
      pagePath='organization.projects'
      showFilters={!hideFilters}
      recordType='Project'
      defaultFilters={
        hideFilters ? undefined : { status: [ProjectFilterOptionStatus.Open] }
      }
      filters={(filters) => omit(filters, 'searchTerm')}
      noSort
    />
  );
};
export default ProjectsTable;
