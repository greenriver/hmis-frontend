import { Paper } from '@mui/material';
import React from 'react';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';

import { GenericTableWithDataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  getServiceTypeForDisplay,
  SERVICE_BASIC_COLUMNS,
  SERVICE_COLUMNS,
} from '@/modules/services/serviceColumns';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetClientServicesDocument,
  GetClientServicesQuery,
  GetClientServicesQueryVariables,
  ServiceSortOption,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type ServiceType = NonNullable<
  NonNullable<GetClientServicesQuery['client']>['services']
>['nodes'][0];

const columns: GenericTableWithDataColumnDef<
  ServiceType,
  GetClientServicesQueryVariables
>[] = [
  { ...SERVICE_BASIC_COLUMNS.serviceDate, sticky: 'left' },
  SERVICE_BASIC_COLUMNS.serviceType,
  {
    key: 'project',
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  {
    ...SERVICE_COLUMNS.serviceDetails,
    optional: {
      defaultHidden: true,
      // todo @martha
    },
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.entryDate,
    optional: {
      defaultHidden: true,
    },
  },
  WITH_ENROLLMENT_COLUMNS.exitDate,
  WITH_ENROLLMENT_COLUMNS.organizationName,
];

const ClientServicesPage: React.FC = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const { client } = useClientDashboardContext();

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
          rowLinkTo={(row) =>
            generateSafePath(EnrollmentDashboardRoutes.SERVICES, {
              clientId: clientId,
              enrollmentId: row.enrollment.id,
            })
          }
          rowName={(row) =>
            `${getServiceTypeForDisplay(row.serviceType)} on ${parseAndFormatDate(row.dateProvided)}`
          }
          rowActionTitle='View Service'
          rowSecondaryActionConfigs={(row) => [
            {
              ...getViewEnrollmentMenuItem(row.enrollment, client),
              // override the default ariaLabel to provide the project name, since we are in the client context
              ariaLabel: `View Enrollment at ${row.enrollment.projectName} for ${entryExitRange(row.enrollment)}`,
            },
          ]}
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
