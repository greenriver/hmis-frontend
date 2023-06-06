import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import { CommonCard } from '@/components/elements/CommonCard';
import { ColumnDef } from '@/components/elements/GenericTable';
import LabelWithContent from '@/components/elements/LabelWithContent';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import ViewServiceRecord from '@/modules/form/components/ViewServiceRecord';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import { cache } from '@/providers/apolloClient';
import {
  DeleteServiceDocument,
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  EnrollmentFieldsFragment,
  FormRole,
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  clientId: string;
  enrollmentId: string;
  enrollment: EnrollmentFieldsFragment;
}

const baseColumns: ColumnDef<ServiceFieldsFragment>[] = [
  {
    header: 'Date Provided',
    linkTreatment: true,
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Category',
    render: 'serviceType.category' as keyof ServiceFieldsFragment,
  },
  {
    header: 'Service Type',
    render: 'serviceType.name' as keyof ServiceFieldsFragment,
  },
  {
    header: 'Details',
    render: (e) => (
      <Stack>
        {serviceDetails(e).map((s, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Typography key={i} variant='body2'>
            {s}
          </Typography>
        ))}
      </Stack>
    ),
  },
];

const ServicesTable: React.FC<Props> = ({ enrollmentId, enrollment }) => {
  const canEditEnrollment = enrollment.access.canEditEnrollments;
  const [viewingRecord, setViewingRecord] = useState<
    ServiceFieldsFragment | undefined
  >();

  const onSuccessfulDelete = useCallback(() => {
    setViewingRecord(undefined);
    cache.evict({ id: `Enrollment:${enrollmentId}`, fieldName: 'services' });
  }, [enrollmentId]);

  const { renderServiceDialog, openServiceDialog, serviceDialogOpen } =
    useServiceDialog({
      enrollmentId,
      projectId: enrollment?.project.id || '',
      service: viewingRecord,
    });

  return (
    <>
      <GenericTableWithData<
        GetEnrollmentServicesQuery,
        GetEnrollmentServicesQueryVariables,
        ServiceFieldsFragment
      >
        handleRowClick={(record) => setViewingRecord(record)}
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentServicesDocument}
        columns={baseColumns}
        pagePath='enrollment.services'
        noData='No services.'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />

      {viewingRecord && (
        <ViewRecordDialog<ServiceFieldsFragment>
          record={viewingRecord}
          formRole={FormRole.Service}
          title='Service'
          open={!!viewingRecord && !serviceDialogOpen}
          onClose={() => setViewingRecord(undefined)}
          pickListRelationId={enrollment.project.id}
          hideRecordContents
          actions={
            canEditEnrollment && (
              <>
                <Button
                  onClick={openServiceDialog}
                  variant='outlined'
                  color='secondary'
                >
                  Edit
                </Button>
                <DeleteMutationButton<
                  DeleteServiceMutation,
                  DeleteServiceMutationVariables
                >
                  queryDocument={DeleteServiceDocument}
                  variables={{ input: { id: viewingRecord.id } }}
                  idPath={'deleteService.service.id'}
                  recordName='Service'
                  onSuccess={onSuccessfulDelete}
                >
                  Delete
                </DeleteMutationButton>
              </>
            )
          }
        >
          <CommonCard>
            {viewingRecord.serviceType.category !==
              viewingRecord.serviceType.name && (
              <LabelWithContent
                label='Service Category'
                LabelProps={{ sx: { fontWeight: 600 } }}
                sx={{ mb: 2 }}
              >
                <Typography variant='body2'>
                  {viewingRecord.serviceType.category}
                </Typography>
              </LabelWithContent>
            )}
            <LabelWithContent
              label='Service Type'
              LabelProps={{ sx: { fontWeight: 600 } }}
              sx={{ mb: 2 }}
            >
              <Typography variant='body2'>
                {viewingRecord.serviceType.name}
              </Typography>
            </LabelWithContent>
            <Box sx={{ px: 2, pt: 2 }}>
              <ViewServiceRecord
                service={viewingRecord}
                projectId={enrollment.project.id}
              />
            </Box>
          </CommonCard>
        </ViewRecordDialog>
      )}
      {renderServiceDialog()}
    </>
  );
};

export default ServicesTable;
