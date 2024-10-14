import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceBasicFieldsFragment,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

export const SERVICE_BASIC_COLUMNS: {
  [key: string]: ColumnDef<ServiceBasicFieldsFragment>;
} = {
  dateProvided: {
    header: 'Date Provided',
    linkTreatment: true,
    render: (s) => parseAndFormatDate(s.dateProvided),
  },
  serviceType: {
    header: 'Service Type',
    render: ({ serviceType }) => {
      if (!serviceType) return 'Unknown Service';
      const { name, category } = serviceType;
      if (name === category) return name;
      return `${category} - ${name}`;
    },
  },
};

export const SERVICE_COLUMNS: {
  [key: string]: ColumnDef<ServiceFieldsFragment>;
} = {
  serviceDetails: {
    header: 'Service Details',
    render: (service) => (
      <Stack>
        {serviceDetails(service).map((s, i) => (
          <Typography
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            variant='body2'
            sx={{
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '1',
              overflow: 'hidden',
              maxWidth: '300px',
            }}
          >
            {s}
          </Typography>
        ))}
      </Stack>
    ),
  },
};

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

  const filters = useFilters({
    type: 'ServicesForEnrollmentFilterOptions',
  });

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  const canEditServices = enrollment.access.canEditEnrollments;

  const columns = [
    SERVICE_BASIC_COLUMNS.dateProvided,
    SERVICE_BASIC_COLUMNS.serviceType,
    SERVICE_COLUMNS.serviceDetails,
  ];

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
          columns={columns}
          pagePath='enrollment.services'
          noData='No services'
          recordType='Service'
          filters={filters}
          headerCellSx={() => ({ color: 'text.secondary' })}
          noSort
        />
      </TitleCard>
      {renderServiceDialog()}
    </>
  );
};

export default EnrollmentServicesPage;
