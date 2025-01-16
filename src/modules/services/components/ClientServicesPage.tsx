import { Paper } from '@mui/material';
import React, { useMemo } from 'react';

import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewEnrollmentMenuItem,
  getViewServiceMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
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
  const { client } = useClientDashboardContext();

  const columns = useMemo(
    () =>
      (
        [
          { ...SERVICE_BASIC_COLUMNS.serviceDate, sticky: 'left' },
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
          {
            ...BASE_ACTION_COLUMN_DEF,
            render: (row) => (
              <TableRowActions
                record={row}
                recordName={`${getServiceTypeForDisplay(row.serviceType)} on ${parseAndFormatDate(row.dateProvided)}`}
                primaryActionConfig={getViewServiceMenuItem(
                  row,
                  row.enrollment.id,
                  clientId
                )}
                secondaryActionConfigs={[
                  {
                    ...getViewEnrollmentMenuItem(row.enrollment, client),
                    // override the default ariaLabel to provide the project name, since we are in the client context
                    ariaLabel: `View Enrollment at ${row.enrollment.projectName} for ${entryExitRange(row.enrollment)}`,
                  },
                ]}
              />
            ),
          },
        ] as ColumnDef<ServiceType>[]
      ).filter((col) => {
        if (omitColumns.includes(col.key || '')) return false;

        return true;
      }),
    [client, clientId, omitColumns]
  );

  const filters = useFilters({
    type: 'ServiceFilterOptions',
  });

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
