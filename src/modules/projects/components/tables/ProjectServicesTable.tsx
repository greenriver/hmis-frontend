import { useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { SERVICE_BASIC_COLUMNS } from '@/modules/enrollment/components/dashboardPages/EnrollmentServicesPage';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
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
        header: 'First Name',
        linkTreatment: true,
        render: (s: ServiceFields) => (
          <ClientName
            client={s.enrollment.client}
            linkToEnrollmentId={s.enrollment.id}
            nameParts='first_only'
          />
        ),
      },
      {
        header: 'Last Name',
        linkTreatment: true,
        render: (s: ServiceFields) => (
          <ClientName
            client={s.enrollment.client}
            linkToEnrollmentId={s.enrollment.id}
            nameParts='last_only'
          />
        ),
      },
      { ...SERVICE_BASIC_COLUMNS.dateProvided, linkTreatment: false },
      SERVICE_BASIC_COLUMNS.serviceType,
      {
        header: 'Enrollment Period',
        render: (s: ServiceFields) =>
          parseAndFormatDateRange(
            s.enrollment.entryDate,
            s.enrollment.exitDate
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
