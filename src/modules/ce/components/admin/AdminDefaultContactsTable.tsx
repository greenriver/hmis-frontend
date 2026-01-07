import { Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import EditCeDefaultContactsModal from './EditCeDefaultContactsModal';
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
  ProjectFilterOptionStatus,
  ProjectSortOption,
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const projectFilters = useFilters({
    type: 'ProjectFilterOptions',
    omit: ['status', 'funder', 'projectType'],
  });

  const columns: DataColumnDef<
    ProjectWithCeDefaultContactsFragment,
    GetDefaultSwimlaneAssignmentsQueryVariables
  >[] = useMemo(() => {
    if (loading || error || !ceSwimlanes) return [];

    const swimlaneColumns = ceSwimlanes.map((swimlane) => {
      return {
        header: `${swimlane.name} (${swimlane.templateName})`,
        key: swimlane.id,
        optional: { defaultHidden: false },
        render: (row: ProjectWithCeDefaultContactsFragment) => {
          // todo @martha - add indication for global or project-level
          const contacts =
            row.ceDefaultContacts.find(
              (swimlaneContacts: CeDefaultContactsBySwimlaneFieldsFragment) =>
                swimlaneContacts.swimlane.id === swimlane.id
            )?.contacts || [];
          return contacts.map((contact) => contact.user.name).join(', ');
        },
      };
    });
    // todo @Martha - add not applicable and missing treatments

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
          queryVariables={{
            filters: {
              status: [ProjectFilterOptionStatus.Open],
              // todo @Martha - only show projects in this list that have some kind of ce workflow enabled. (needs new filter?)
            },
          }}
          defaultSortOption={ProjectSortOption.Name}
          queryDocument={GetDefaultSwimlaneAssignmentsDocument}
          pagePath='projects'
          paginationItemName='project'
          handleRowClick={(row) => setEditingProjectId(row.id)}
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
          // todo @martha - need to enable filter by users. in general, filtering needs revisiting
          // maybe the neatest thing is for this to use a different query, not the base projects query?
          filters={projectFilters}
        />
      </Paper>

      {editingProjectId && (
        <EditCeDefaultContactsModal
          projectId={editingProjectId}
          open={!!editingProjectId}
          onClose={() => setEditingProjectId(null)}
        />
      )}
    </>
  );
};

export default AdminDefaultContactsTable;
