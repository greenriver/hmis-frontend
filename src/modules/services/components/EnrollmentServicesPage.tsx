import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useState } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import {
  getServiceTypeForDisplay,
  SERVICE_BASIC_COLUMNS,
  SERVICE_COLUMNS,
} from '@/modules/services/serviceColumns';
import {
  DataCollectionFeatureRole,
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<ServiceFieldsFragment>[] = [
  { ...SERVICE_BASIC_COLUMNS.serviceDate, sticky: 'left' },
  SERVICE_BASIC_COLUMNS.serviceType,
  SERVICE_COLUMNS.serviceDetails,
];

const EnrollmentServicesPage = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
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

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'ServicesForEnrollmentFilterOptions',
  });

  const serviceFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.Service
  );

  const canEditServices = enrollment?.access.canEditEnrollments;

  const openService = useCallback(
    (service: ServiceFieldsFragment) => {
      setViewingRecord(service);
      openServiceDialog();
    },
    [openServiceDialog]
  );

  if (!enrollment || !enrollmentId || !clientId || !serviceFeature)
    return <NotFound />;

  return (
    <>
      <TitleCard
        title='Services'
        actions={
          enrollment.access.canEditEnrollments &&
          !serviceFeature.legacy && (
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
        headerComponent='h1'
      >
        <GenericTableWithData<
          GetEnrollmentServicesQuery,
          GetEnrollmentServicesQueryVariables,
          ServiceFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentServicesDocument}
          columns={COLUMNS}
          handleRowClick={
            canEditServices ? (service) => openService(service) : undefined
          }
          hideMenu={!canEditServices}
          rowName={(row) =>
            `${getServiceTypeForDisplay(row.serviceType)} on ${parseAndFormatDate(row.dateProvided)}`
          }
          rowActionTitle='Update Service'
          pagePath='enrollment.services'
          noData='No services'
          recordType='Service'
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          noSort
        />
      </TitleCard>
      {renderServiceDialog()}
    </>
  );
};

export default EnrollmentServicesPage;
