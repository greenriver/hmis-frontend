import { Paper } from '@mui/material';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetDefaultSwimlaneAssignmentsDocument,
  GetDefaultSwimlaneAssignmentsQuery,
  GetDefaultSwimlaneAssignmentsQueryVariables,
  ProjectFilterOptionStatus,
  ProjectSortOption,
  ProjectWithDefaultSwimlaneAssignmentsFragment,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const BASE_COLUMNS: DataColumnDef<
  ProjectWithDefaultSwimlaneAssignmentsFragment,
  GetDefaultSwimlaneAssignmentsQueryVariables
>[] = [
  {
    header: 'Project',
    key: 'project',
    render: 'projectName',
    sticky: 'left',
  },
  {
    header: 'Organization',
    key: 'organization',
    render: (row: ProjectWithDefaultSwimlaneAssignmentsFragment) =>
      row.organization.organizationName,
    optional: { defaultHidden: false },
  },
];

interface Props {}
const AdminDefaultContactsTable: React.FC<Props> = ({}) => {
  const { data: { ceSwimlanes } = {}, loading, error } = useGetSwimlanesQuery();

  const projectFilters = useFilters({
    type: 'ProjectFilterOptions',
    omit: ['status', 'funder', 'projectType'],
  });

  const columns: DataColumnDef<
    ProjectWithDefaultSwimlaneAssignmentsFragment,
    GetDefaultSwimlaneAssignmentsQueryVariables
  >[] = useMemo(() => {
    if (loading || error || !ceSwimlanes) return [];

    const swimlaneColumns = ceSwimlanes.map((swimlane) => {
      return {
        header: `${swimlane.name} (${swimlane.templateName})`,
        key: swimlane.id,
        optional: { defaultHidden: false },
        render: (row: ProjectWithDefaultSwimlaneAssignmentsFragment) => {
          // todo @martha - render as comma separated list, include indication for global or project-level
          return row.defaultSwimlaneAssignments
            .filter(
              (swimlaneAssignment) =>
                swimlaneAssignment.swimlane.id === swimlane.id
            )
            .map((swimlaneAssignment) =>
              swimlaneAssignment.assignments.map(
                (assignment) => assignment.user.name
              )
            );
        },
      };
    });

    return [...BASE_COLUMNS, ...swimlaneColumns];
  }, [ceSwimlanes, error, loading]);

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <Paper>
      <GenericTableWithData<
        GetDefaultSwimlaneAssignmentsQuery,
        GetDefaultSwimlaneAssignmentsQueryVariables,
        ProjectWithDefaultSwimlaneAssignmentsFragment
      >
        columns={columns}
        queryVariables={{
          filters: {
            status: [ProjectFilterOptionStatus.Open],
          },
        }}
        defaultSortOption={ProjectSortOption.Name}
        queryDocument={GetDefaultSwimlaneAssignmentsDocument}
        pagePath='projects'
        paginationItemName='project'
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
            projectId: row.id,
          })
        }
        rowActionTitle='View Project'
        rowSecondaryActionConfigs={(row) => [
          {
            key: 'edit',
            title: 'Edit Project Contacts',
            to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
              projectId: row.id,
            }),
          },
        ]}
        filters={projectFilters}
      />
    </Paper>
  );
};

export default AdminDefaultContactsTable;
