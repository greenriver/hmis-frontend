import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { ColumnDef } from '@/components/elements/GenericTable';
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

const ProjectsTable = ({ organizationId }: { organizationId: string }) => {
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

  const rowLinkTo = useCallback(
    (project: ProjectAllFieldsFragment) =>
      generatePath(Routes.PROJECT, {
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
      queryVariables={{ id: organizationId }}
      queryDocument={GetOrganizationWithPaginatedProjectsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No projects.'
      pagePath='organization.projects'
    />
  );
};
export default ProjectsTable;
