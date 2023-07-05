import { Stack, Typography } from '@mui/material';
import { useState } from 'react';

import LabelWithContent from '@/components/elements/LabelWithContent';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import {
  EnrollmentFieldsFragment,
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
  const canEditServices = enrollment.access.canEditEnrollments;
  const [viewingRecord, setViewingRecord] = useState<
    ServiceFieldsFragment | undefined
  >();

  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
    service: viewingRecord,
  });

  return (
    <>
      <GenericTableWithData<
        GetEnrollmentServicesQuery,
        GetEnrollmentServicesQueryVariables,
        ServiceFieldsFragment
      >
        handleRowClick={
          canEditServices
            ? (record) => {
                setViewingRecord(record);
                openServiceDialog();
              }
            : undefined
        }
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentServicesDocument}
        columns={baseColumns}
        pagePath='enrollment.services'
        noData='No services'
        recordType='Service'
        showFilters
        filterInputType='ServicesForEnrollmentFilterOptions'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />

      {viewingRecord &&
        renderServiceDialog({
          dialogContent: (
            <>
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
            </>
          ),
        })}
    </>
  );
};

export default ServicesTable;
