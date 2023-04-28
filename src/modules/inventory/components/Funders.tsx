import AddIcon from '@mui/icons-material/Add';
import { Button, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FunderFieldsFragment,
  GetProjectFundersDocument,
  useDeleteFunderMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<FunderFieldsFragment>[] = [
  {
    header: 'Funder',
    linkTreatment: true,
    render: (f: FunderFieldsFragment) => (
      <HmisEnum value={f.funder} enumMap={HmisEnums.FundingSource} />
    ),
  },
  {
    header: 'Active Period',
    render: (f: FunderFieldsFragment) =>
      parseAndFormatDateRange(f.startDate, f.endDate),
  },
  { header: 'Grant ID', render: 'grantId' },
];

// interface Props
//   extends Omit<
//     GenericTableWithDataProps<
//       GetProjectFundersQuery,
//       GetProjectFundersQueryVariables,
//       FunderFieldsFragment
//     >,
//     'queryVariables' | 'queryDocument' | 'pagePath'
//   > {
//   projectId: string;
// }

const FunderTable = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const [recordToDelete, setDelete] = useState<FunderFieldsFragment | null>(
    null
  );
  const [canEditProject] = useHasProjectPermissions(projectId, [
    'canEditProjectDetails',
  ]);

  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteFunderMutation({
      onCompleted: (res) => {
        const id = res.deleteFunder?.funder?.id;
        if (id) {
          setDelete(null);
          // Force re-fetch table
          cache.evict({ id: `Project:${projectId}`, fieldName: 'funders' });
        }
      },
    });
  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteRecord({ variables: { input: { id: recordToDelete.id } } });
  }, [recordToDelete, deleteRecord]);
  if (deleteError) console.error(deleteError);

  // console.log('cache at table', cache.data.data);
  const tableColumns = useMemo(() => {
    return [
      ...columns,
      ...(canEditProject
        ? [
            {
              key: 'actions',
              width: '1%',
              render: (record: FunderFieldsFragment) => (
                <Stack direction='row' spacing={1}>
                  <ButtonLink
                    data-testid='updateButton'
                    to={generateSafePath(ProjectDashboardRoutes.EDIT_FUNDER, {
                      projectId,
                      funderId: record.id,
                    })}
                    size='small'
                    variant='outlined'
                  >
                    Edit
                  </ButtonLink>
                  <Button
                    data-testid='deleteButton'
                    onClick={() => setDelete(record)}
                    size='small'
                    variant='outlined'
                    color='error'
                  >
                    Delete
                  </Button>
                </Stack>
              ),
            },
          ]
        : []),
    ];
  }, [projectId, canEditProject]);

  return (
    <>
      <PageTitle
        title='Funders'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditProjectDetails'
          >
            <ButtonLink
              data-testid='addFunderButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_FUNDER, {
                projectId,
              })}
              Icon={AddIcon}
            >
              Add Funder
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Paper>
        <GenericTableWithData
          queryVariables={{ id: projectId }}
          queryDocument={GetProjectFundersDocument}
          columns={tableColumns}
          recordType='Funder'
          pagePath='project.funders'
          noData='No funding sources.'
        />
      </Paper>
      <ProjectPermissionsFilter
        id={projectId}
        permissions='canEditProjectDetails'
      >
        <ConfirmationDialog
          id='deleteProjectCoc'
          open={!!recordToDelete}
          title='Delete Project CoC record'
          onConfirm={handleDelete}
          onCancel={() => setDelete(null)}
          loading={deleteLoading}
        >
          {recordToDelete && (
            <>
              <Typography>
                Are you sure you want to delete funding source record for{' '}
                <strong>
                  {HmisEnums.FundingSource[recordToDelete.funder] ||
                    recordToDelete.funder}
                </strong>
                ?
              </Typography>
              <Typography>This action cannot be undone.</Typography>
            </>
          )}
        </ConfirmationDialog>
      </ProjectPermissionsFilter>
    </>
  );
};
export default FunderTable;
