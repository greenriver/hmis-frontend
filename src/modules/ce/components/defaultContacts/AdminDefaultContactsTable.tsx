import { Paper, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import EditCeDefaultContactsModal from '../admin/EditCeDefaultContactsModal';
import DefaultContactNamesList from './DefaultContactNamesList';
import SwimlaneLabel from './SwimlaneLabel';
import Loading from '@/components/elements/Loading';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeDefaultContactsBySwimlaneFieldsFragment,
  GetDefaultSwimlaneAssignmentsDocument,
  GetDefaultSwimlaneAssignmentsQuery,
  GetDefaultSwimlaneAssignmentsQueryVariables,
  ProjectWithCeDefaultContactsFragment,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const BASE_COLUMNS: DataColumnDef<
  ProjectWithCeDefaultContactsFragment,
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
    render: (row: ProjectWithCeDefaultContactsFragment) =>
      row.organization.organizationName,
    optional: { defaultHidden: false },
  },
];

interface Props {}
const AdminDefaultContactsTable: React.FC<Props> = ({}) => {
  const { data: { ceSwimlanes } = {}, loading, error } = useGetSwimlanesQuery();
  const [editingProject, setEditingProject] =
    useState<ProjectWithCeDefaultContactsFragment | null>(null);

  const filters = useFilters({
    type: 'ProjectsWithCeDefaultContactsFilterOptions',
  });

  const columns: DataColumnDef<
    ProjectWithCeDefaultContactsFragment,
    GetDefaultSwimlaneAssignmentsQueryVariables
  >[] = useMemo(() => {
    if (loading || error || !ceSwimlanes) return [];

    const swimlaneColumns = ceSwimlanes.map((swimlane) => {
      return {
        header: <SwimlaneLabel swimlane={swimlane} />,
        key: swimlane.id,
        optional: { defaultHidden: false },
        render: (row: ProjectWithCeDefaultContactsFragment) => {
          if (!row.ceSwimlanes.find((s) => s.id === swimlane.id)) {
            // The project's applicable swimlanes list doesn't include this column, so show n/a
            return (
              <Typography variant='body2' color='text.secondary'>
                Not applicable
              </Typography>
            );
          }

          const contacts =
            row.ceDefaultContacts.find(
              (swimlaneContacts: CeDefaultContactsBySwimlaneFieldsFragment) =>
                swimlaneContacts.swimlane.id === swimlane.id
            )?.contacts || [];

          return (
            <DefaultContactNamesList
              contacts={contacts}
              italicizeGlobalContacts={true}
            />
          );
        },
      };
    });

    return [...BASE_COLUMNS, ...swimlaneColumns];
  }, [ceSwimlanes, error, loading]);

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <Paper>
        <GenericTableWithData<
          GetDefaultSwimlaneAssignmentsQuery,
          GetDefaultSwimlaneAssignmentsQueryVariables,
          ProjectWithCeDefaultContactsFragment
        >
          columns={columns}
          queryVariables={{}}
          filters={filters}
          queryDocument={GetDefaultSwimlaneAssignmentsDocument}
          pagePath='projectsWithCeDefaultContacts'
          paginationItemName='coordinated entry project'
          handleRowClick={(row) => setEditingProject(row)}
          rowActionTitle='Edit Project Contacts'
          rowSecondaryActionConfigs={(row) => [
            {
              key: 'view',
              title: 'View Project',
              to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
                projectId: row.id,
              }),
            },
          ]}
        />
      </Paper>

      {editingProject && (
        <EditCeDefaultContactsModal
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
};

export default AdminDefaultContactsTable;
