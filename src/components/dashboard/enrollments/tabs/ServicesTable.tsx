import { Button, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
  useDeleteServiceMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  clientId: string;
  enrollmentId: string;
}

const baseColumns: ColumnDef<ServiceFieldsFragment>[] = [
  {
    header: 'Date Provided',
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Type',
    linkTreatment: true,
    render: (e) => (
      <HmisEnum
        value={e.recordType}
        color='inherit'
        enumMap={HmisEnums.RecordType}
      />
    ),
  },
  {
    header: 'Details',
    render: (e) => (
      <Stack>
        {serviceDetails(e).map((s, i) => (
          <Typography key={i} variant='body2'>
            {s}
          </Typography>
        ))}
      </Stack>
    ),
  },
];

const ServicesTable: React.FC<Props> = ({ clientId, enrollmentId }) => {
  const [recordToDelete, setRecordToDelete] =
    useState<ServiceFieldsFragment | null>(null);
  const rowLinkTo = useCallback(
    (record: ServiceFieldsFragment) =>
      generateSafePath(DashboardRoutes.EDIT_SERVICE, {
        clientId,
        enrollmentId,
        serviceId: record.id,
      }),
    [clientId, enrollmentId]
  );

  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteServiceMutation({
      onCompleted: (res) => {
        const id = res.deleteService?.service?.id;
        if (id) {
          setRecordToDelete(null);
          // Force re-fetch table
          cache.evict({
            id: `Enrollment:${enrollmentId}`,
            fieldName: 'services',
          });
        }
      },
    });
  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteRecord({ variables: { input: { id: recordToDelete.id } } });
  }, [recordToDelete, deleteRecord]);
  if (deleteError) console.error(deleteError);

  const [canEditEnrollments] = useHasClientPermissions(clientId, [
    'canEditEnrollments',
  ]);

  const columns = useMemo(
    () =>
      canEditEnrollments
        ? [
            ...baseColumns,
            {
              header: '',
              render: (record) => (
                <Stack direction='row' spacing={1}>
                  <Button
                    data-testid='deleteService'
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setRecordToDelete(record);
                    }}
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
        : baseColumns,
    [canEditEnrollments]
  );

  return (
    <Stack>
      <GenericTableWithData<
        GetEnrollmentServicesQuery,
        GetEnrollmentServicesQueryVariables,
        ServiceFieldsFragment
      >
        rowLinkTo={rowLinkTo}
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentServicesDocument}
        columns={columns}
        pagePath='enrollment.services'
        noData='No services.'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
      <ConfirmationDialog
        id='deleteService'
        open={!!recordToDelete}
        title='Delete Service'
        onConfirm={handleDelete}
        onCancel={() => setRecordToDelete(null)}
        loading={deleteLoading}
      >
        {recordToDelete && (
          <>
            <Typography>
              Are you sure you want to delete this service?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    </Stack>
  );
};

export default ServicesTable;
