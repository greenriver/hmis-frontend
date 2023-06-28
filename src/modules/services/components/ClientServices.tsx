import { Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  enrollmentName,
  parseAndFormatDate,
  parseAndFormatDateRange,
  serviceDetails,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  GetClientServicesQuery,
  GetClientServicesQueryVariables,
  GetClientServicesDocument,
  ServiceSortOption,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

type ServiceType = NonNullable<
  NonNullable<GetClientServicesQuery['client']>['services']
>['nodes'][0];

const baseColumns: ColumnDef<ServiceType>[] = [
  {
    header: 'Date Provided',
    linkTreatment: true,
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Category',
    render: 'serviceType.category' as keyof ServiceType,
  },
  {
    header: 'Service Type',
    render: 'serviceType.name' as keyof ServiceType,
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
  {
    key: 'enrollmentPeriod',
    header: 'Enrollment Period',
    render: (a) =>
      parseAndFormatDateRange(a.enrollment.entryDate, a.enrollment.exitDate),
  },
];

const ClientServices: React.FC<{
  omitColumns?: string[];
  enrollmentId?: string;
}> = ({ omitColumns = [] }) => {
  const { clientId } = useSafeParams() as { clientId: string };

  const columns = useMemo(
    () =>
      (
        [
          ...baseColumns,
          {
            key: 'project',
            header: 'Project',
            render: (row) => (
              <RouterLink
                to={[
                  generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
                    enrollmentId: row.enrollment.id,
                    clientId,
                  }),
                  'services',
                ].join('#')}
              >
                {enrollmentName(row.enrollment)}
              </RouterLink>
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
