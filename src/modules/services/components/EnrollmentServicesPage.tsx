import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';

import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import {
  SERVICE_BASIC_COLUMNS,
  SERVICE_COLUMNS,
} from '@/modules/services/serviceColumns';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

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
