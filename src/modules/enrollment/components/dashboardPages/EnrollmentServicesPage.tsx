import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

export const SERVICE_COLUMNS: ColumnDef<ServiceFieldsFragment>[] = [
  {
    header: 'Date Provided',
    linkTreatment: true,
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Service Type',
    render: (service) => {
      const { name, category } = service.serviceType;
      if (name === category) return name;
      return `${category} - ${name}`;
    },
  },
  {
    header: 'Service Details',
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

const EnrollmentServicesPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const [viewingRecord, setViewingRecord] = useState<
    ServiceFieldsFragment | undefined
  >();

  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
    service: viewingRecord,
    onClose: () => setViewingRecord(undefined),
  });
  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  const canEditServices = enrollment.access.canEditEnrollments;
  return (
    <>
      <TitleCard
        title='Services'
        actions={
          enrollment.access.canEditEnrollments && (
            <Button
              onClick={openServiceDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Service
            </Button>
          )
        }
        headerVariant='border'
      >
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
          columns={SERVICE_COLUMNS}
          pagePath='enrollment.services'
          noData='No services'
          recordType='Service'
          showFilters
          filterInputType='ServicesForEnrollmentFilterOptions'
          headerCellSx={() => ({ color: 'text.secondary' })}
        />
      </TitleCard>
      {renderServiceDialog()}
    </>
  );
};

export default EnrollmentServicesPage;
