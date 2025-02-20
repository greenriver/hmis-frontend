import { useMemo } from 'react';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';

import { useFilters } from '@/modules/hmis/filterUtil';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  getServiceTypeForDisplay,
  SERVICE_BASIC_COLUMNS,
} from '@/modules/services/serviceColumns';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetProjectServicesDocument,
  GetProjectServicesQuery,
  GetProjectServicesQueryVariables,
  ServicesForProjectFilterOptions,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export type ServiceFields = NonNullable<
  GetProjectServicesQuery['project']
>['services']['nodes'][number];

const ProjectServicesTable = ({
  projectId,
  columns,
}: {
  projectId: string;
  columns?: ColumnDef<ServiceFields>[];
}) => {
  const displayColumns: ColumnDef<ServiceFields>[] = useMemo(() => {
    if (columns) return columns;
    return [
      {
        header: 'Client Name',
        sticky: 'left',
        render: (s: ServiceFields) => (
          <ClientName client={s.enrollment.client} />
        ),
      },
      SERVICE_BASIC_COLUMNS.serviceDate,
      SERVICE_BASIC_COLUMNS.serviceType,
      WITH_ENROLLMENT_COLUMNS.entryDate,
      WITH_ENROLLMENT_COLUMNS.exitDate,
    ];
  }, [columns]);

  const filters = useFilters({
    type: 'ServicesForProjectFilterOptions',
  });

  return (
    <GenericTableWithData<
      GetProjectServicesQuery,
      GetProjectServicesQueryVariables,
      ServiceFields,
      ServicesForProjectFilterOptions
    >
      queryVariables={{
        id: projectId,
      }}
      queryDocument={GetProjectServicesDocument}
      columns={displayColumns}
      rowLinkTo={(row) =>
        generateSafePath(EnrollmentDashboardRoutes.SERVICES, {
          clientId: row.enrollment.client.id,
          enrollmentId: row.enrollment.id,
        })
      }
      rowName={(row) =>
        `${clientBriefName(row.enrollment.client)}'s ${getServiceTypeForDisplay(row.serviceType)} on ${parseAndFormatDate(row.dateProvided)}`
      }
      rowActionTitle='View Service'
      rowSecondaryActionConfigs={(row) => [
        getViewEnrollmentMenuItem(row.enrollment, row.enrollment.client),
      ]}
      noData='No services'
      pagePath='project.services'
      recordType='Service'
      filters={filters}
      showOptionalColumns
    />
  );
};
export default ProjectServicesTable;
