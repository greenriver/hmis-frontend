import { Paper } from '@mui/material';
import { useMemo } from 'react';

import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { SERVICE_COLUMNS } from '@/modules/enrollment/components/dashboardPages/EnrollmentServicesPage';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetClientServicesDocument,
  GetClientServicesQuery,
  GetClientServicesQueryVariables,
  ServiceSortOption,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

type ServiceType = NonNullable<
  NonNullable<GetClientServicesQuery['client']>['services']
>['nodes'][0];

const ClientServices: React.FC<{
  omitColumns?: string[];
  enrollmentId?: string;
}> = ({ omitColumns = [] }) => {
  const { clientId } = useSafeParams() as { clientId: string };

  const columns = useMemo(
    () =>
      (
        [
          ...SERVICE_COLUMNS.filter((col) => col.header != 'Service Details'),
          {
            key: 'project',
            header: 'Project Name',
            render: (row) => (
              <RouterLink
                to={[
                  generateSafePath(
                    EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                    {
                      enrollmentId: row.enrollment.id,
                      clientId,
                    }
                  ),
                  'services',
                ].join('#')}
              >
                {enrollmentName(row.enrollment)}
              </RouterLink>
            ),
          },
          {
            key: 'en-period',
            header: 'Enrollment Period',
            render: (row) => (
              <EnrollmentDateRangeWithStatus enrollment={row.enrollment} />
            ),
          },
        ] as ColumnDef<ServiceType>[]
      ).filter((col) => {
        if (omitColumns.includes(col.key || '')) return false;

        return true;
      }),
    [clientId, omitColumns]
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
          showFilters
          queryVariables={{ id: clientId }}
          queryDocument={GetClientServicesDocument}
          columns={columns}
          pagePath='client.services'
          fetchPolicy='cache-and-network'
          noData='No services'
          recordType='Service'
          noSort
          defaultSortOption={ServiceSortOption.DateProvided}
        />
      </Paper>
    </>
  );
};

export default ClientServices;
