import { useMemo } from 'react';

import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewEnrollmentMenuItem,
  getViewServiceMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
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
import {
  GetProjectServicesDocument,
  GetProjectServicesQuery,
  GetProjectServicesQueryVariables,
  ServicesForProjectFilterOptions,
} from '@/types/gqlTypes';

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
        render: (s: ServiceFields) => (
          <ClientName client={s.enrollment.client} />
        ),
      },
      { ...SERVICE_BASIC_COLUMNS.serviceDate, linkTreatment: false },
      SERVICE_BASIC_COLUMNS.serviceType,
      WITH_ENROLLMENT_COLUMNS.entryDate,
      WITH_ENROLLMENT_COLUMNS.exitDate,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (service: ServiceFields) => (
          <TableRowActions
            record={service}
            recordName={`${clientBriefName(service.enrollment.client)}'s ${getServiceTypeForDisplay(service.serviceType)} on ${parseAndFormatDate(service.dateProvided)}`}
            primaryActionConfig={getViewServiceMenuItem(
              service,
              service.enrollment.id,
              service.enrollment.client.id
            )}
            secondaryActionConfigs={[
              getViewEnrollmentMenuItem(
                service.enrollment,
                service.enrollment.client
              ),
            ]}
          />
        ),
      },
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
      noData='No services'
      pagePath='project.services'
      recordType='Service'
      filters={filters}
    />
  );
};
export default ProjectServicesTable;
