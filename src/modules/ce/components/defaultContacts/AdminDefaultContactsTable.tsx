import { Paper, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import DefaultContactNamesList from './DefaultContactNamesList';
import SwimlaneLabel from './SwimlaneLabel';
import Loading from '@/components/elements/Loading';
import EditProjectCeDefaultContactsModal from '@/modules/ce/components/defaultContacts/EditProjectCeDefaultContactsModal';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeDefaultContactsBySwimlaneFieldsFragment,
  GetDefaultContactsDocument,
  GetDefaultContactsQuery,
  GetDefaultContactsQueryVariables,
  ProjectFilterOptionStatus,
  ProjectSortOption,
  ProjectWithCeDefaultContactsFragment,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const BASE_COLUMNS: DataColumnDef<
  ProjectWithCeDefaultContactsFragment,
  GetDefaultContactsQueryVariables
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
    type: 'ProjectFilterOptions',
    omit: ['status', 'funder', 'organization', 'projectType', 'ceEnabled'],
  });

  const columns: DataColumnDef<
    ProjectWithCeDefaultContactsFragment,
    GetDefaultContactsQueryVariables
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
          GetDefaultContactsQuery,
          GetDefaultContactsQueryVariables,
          ProjectWithCeDefaultContactsFragment
        >
          columns={columns}
          queryVariables={{
            filters: {
              status: [ProjectFilterOptionStatus.Open],
              ceEnabled: true,
            },
          }}
          defaultSortOption={ProjectSortOption.OrganizationAndName}
          filters={filters}
          queryDocument={GetDefaultContactsDocument}
          pagePath='projects'
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
        <EditProjectCeDefaultContactsModal
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
};

export default AdminDefaultContactsTable;
