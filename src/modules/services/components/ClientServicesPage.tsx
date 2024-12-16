import { Paper } from '@mui/material';
import { useCallback, useMemo } from 'react';

import {
  getViewEnrollmentAction,
  getViewServiceAction,
} from '@/components/elements/table/tableActions/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';

import { useFilters } from '@/modules/hmis/filterUtil';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  getServiceTypeForDisplay,
  SERVICE_BASIC_COLUMNS,
  SERVICE_COLUMNS,
} from '@/modules/services/serviceColumns';
import {
  GetClientServicesDocument,
  GetClientServicesQuery,
  GetClientServicesQueryVariables,
  ServiceSortOption,
} from '@/types/gqlTypes';

type ServiceType = NonNullable<
  NonNullable<GetClientServicesQuery['client']>['services']
>['nodes'][0];

const ClientServicesPage: React.FC<{
  omitColumns?: string[];
  enrollmentId?: string;
}> = ({ omitColumns = [] }) => {
  const { clientId } = useSafeParams() as { clientId: string };

  const columns = useMemo(
    () =>
      (
        [
          SERVICE_BASIC_COLUMNS.serviceDate,
          SERVICE_BASIC_COLUMNS.serviceType,
          {
            key: 'project',
            header: 'Project Name',
            render: (row) => row.enrollment.projectName,
          },
          {
            ...SERVICE_COLUMNS.serviceDetails,
            optional: true,
            defaultHidden: true,
          },
        ] as ColumnDef<ServiceType>[]
      ).filter((col) => {
        if (omitColumns.includes(col.key || '')) return false;

        return true;
      }),
    [omitColumns]
  );

  const filters = useFilters({
    type: 'ServiceFilterOptions',
  });

  const getTableRowActions = useCallback(
    (service: ServiceType) => {
      return {
        primaryAction: getViewServiceAction(
          service,
          service.enrollment.id,
          clientId
        ),
        secondaryActions: [
          {
            ...getViewEnrollmentAction(service.enrollment, { id: clientId }),
            // override the default ariaLabel to provide the project name, since we are in the client context
            ariaLabel: `View Enrollment at ${service.enrollment.projectName} for ${entryExitRange(service.enrollment)}`,
          },
        ],
      };
    },
    [clientId]
  );

  return (
    <>
      <PageTitle title='Services' />
      <Paper>
        <GenericTableWithData<
          GetClientServicesQuery,
          GetClientServicesQueryVariables,
          ServiceType
        >
          filters={filters}
          queryVariables={{ id: clientId }}
          queryDocument={GetClientServicesDocument}
          columns={columns}
          getTableRowActions={getTableRowActions}
          getRowAccessibleName={(record) =>
            `${getServiceTypeForDisplay(record.serviceType)} on ${parseAndFormatDate(record.dateProvided)}`
          }
          pagePath='client.services'
          fetchPolicy='cache-and-network'
          noData='No services'
          recordType='Service'
          defaultSortOption={ServiceSortOption.DateProvided}
          noSort
          showOptionalColumns
        />
      </Paper>
    </>
  );
};

export default ClientServicesPage;
