import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
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
      render: (project: ProjectAllFieldsFragment) =>
        project.projectType
          ? HmisEnums.ProjectType[project.projectType]
          : project.continuumProject
          ? 'Continuum Project'
          : null,
    },
    {
      header: 'Start Date',
      render: (project: ProjectAllFieldsFragment) =>
        project.operatingStartDate &&
        HmisUtil.parseAndFormatDate(project.operatingStartDate),
    },
    {
      header: 'End Date',
      render: (project: ProjectAllFieldsFragment) =>
        (project.operatingEndDate &&
          HmisUtil.parseAndFormatDate(project.operatingEndDate)) ||
        'Active',
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
      toNodes={(data: GetOrganizationWithPaginatedProjectsQuery) =>
        data.organization?.projects?.nodes || []
      }
      toNodesCount={(data: GetOrganizationWithPaginatedProjectsQuery) =>
        data.organization?.projects?.nodesCount
      }
    />
  );
};
export default ProjectsTable;
