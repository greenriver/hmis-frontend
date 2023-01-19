import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FunderFieldsFragment,
  GetProjectFundersDocument,
  GetProjectFundersQuery,
  GetProjectFundersQueryVariables,
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

interface Props
  extends Omit<
    GenericTableWithDataProps<
      GetProjectFundersQuery,
      GetProjectFundersQueryVariables,
      FunderFieldsFragment
    >,
    'queryVariables' | 'queryDocument' | 'pagePath'
  > {
  projectId: string;
}

const FunderTable = ({ projectId, ...props }: Props) => {
  const [recordToDelete, setDelete] = useState<FunderFieldsFragment | null>(
    null
  );

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
      {
        key: 'actions',
        width: '1%',
        render: (record: FunderFieldsFragment) => (
          <Stack direction='row' spacing={1}>
            <ButtonLink
              data-testid='updateButton'
              to={generateSafePath(Routes.EDIT_FUNDER, {
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
    ];
  }, [projectId]);

  return (
    <>
      <GenericTableWithData
        queryVariables={{ id: projectId }}
        queryDocument={GetProjectFundersDocument}
        columns={tableColumns}
        pagePath='project.funders'
        noData='No funding sources.'
        {...props}
      />
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
    </>
  );
};
export default FunderTable;
