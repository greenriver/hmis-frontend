import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useMemo, useState } from 'react';

import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { useFilters } from '@/modules/hmis/filterUtil';
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

  const filters = useFilters({
    type: 'ServicesForEnrollmentFilterOptions',
  });

  const serviceFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.Service
  );

  const canEditServices = enrollment?.access.canEditEnrollments;

  const columns = useMemo(() => {
    return [
      SERVICE_BASIC_COLUMNS.serviceDate,
      SERVICE_BASIC_COLUMNS.serviceType,
      SERVICE_COLUMNS.serviceDetails,
      ...(canEditServices
        ? [
            {
              ...BASE_ACTION_COLUMN_DEF,
              render: (service: ServiceFieldsFragment) => (
                <TableRowActions
                  record={service}
                  recordName={`${getServiceTypeForDisplay(service.serviceType)} on ${parseAndFormatDate(service.dateProvided)}`}
                  primaryActionConfig={{
                    title: 'Update Service',
                    key: 'service',
                    onClick: () => {
                      setViewingRecord(service);
                      openServiceDialog();
                    },
                  }}
                />
              ),
            },
          ]
        : []),
    ];
  }, [canEditServices, openServiceDialog]);

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
