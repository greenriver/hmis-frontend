import { useMemo } from 'react';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import useTableFilters from '@/hooks/useTableFilters';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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
        key: 'clientName',
      },
      SERVICE_BASIC_COLUMNS.serviceDate,
      SERVICE_BASIC_COLUMNS.serviceType,
      WITH_ENROLLMENT_COLUMNS.entryDate,
      WITH_ENROLLMENT_COLUMNS.exitDate,
    ];
  }, [columns]);

  const { filters, filterValues, setFilterValues } =
    useTableFilters<ServicesForProjectFilterOptions>({
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
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    />
  );
};
export default ProjectServicesTable;
