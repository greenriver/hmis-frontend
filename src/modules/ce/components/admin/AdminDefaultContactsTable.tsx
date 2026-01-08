import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import React, { Fragment, useMemo, useState } from 'react';
import EditCeDefaultContactsModal from './EditCeDefaultContactsModal';
import Loading from '@/components/elements/Loading';
import { ErrorIcon, InfoIcon } from '@/components/elements/SemanticIcons';
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
        header: (
          <Stack direction='row' spacing={1} alignItems='center'>
            <span>
              {swimlane.name} ({swimlane.templateName})
            </span>
            <Tooltip title={`Tasks: ${swimlane.taskNames.join(', ')}`}>
              <InfoIcon sx={{ fontSize: 'inherit', color: 'text.secondary' }} />
            </Tooltip>
          </Stack>
        ),
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

          if (contacts.length === 0) {
            return (
              <Typography
                variant='body2'
                color='warning.dark'
                fontWeight='600'
                sx={{ verticalAlign: 'center' }}
              >
                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <ErrorIcon sx={{ fontSize: 'inherit' }} />
                  <span>Missing</span>
                </Stack>
              </Typography>
            );
          }

          return (
            <>
              {contacts.map((contact, idx) => (
                <Fragment key={contact.user.id}>
                  {idx > 0 && ', '}
                  <Typography
                    variant='body2'
                    component='span'
                    // If this is a global contact, italicize the name, to help indicate that it should be edited in the Global modal and not the Project modal
                    sx={{ fontStyle: contact.project ? 'normal' : 'italic' }}
                  >
                    {contact.user.name}
                  </Typography>
                </Fragment>
              ))}
            </>
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
