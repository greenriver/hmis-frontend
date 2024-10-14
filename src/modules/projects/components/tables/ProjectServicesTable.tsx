import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { SERVICE_BASIC_COLUMNS } from '@/modules/enrollment/components/pages/EnrollmentServicesPage';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { useFilters } from '@/modules/hmis/filterUtil';
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
        header: 'First Name',
        linkTreatment: true,
        render: (s: ServiceFields) => (
          <ClientName client={s.enrollment.client} nameParts='first_only' />
        ),
      },
      {
        header: 'Last Name',
        linkTreatment: true,
        render: (s: ServiceFields) => (
          <ClientName client={s.enrollment.client} nameParts='last_only' />
        ),
      },
      { ...SERVICE_BASIC_COLUMNS.dateProvided, linkTreatment: false },
      SERVICE_BASIC_COLUMNS.serviceType,
      {
        header: 'Enrollment Period',
        render: (s: ServiceFields) => (
          <EnrollmentDateRangeWithStatus enrollment={s.enrollment} />
        ),
      },
    ];
  }, [columns]);

  const filters = useFilters({
    type: 'ServicesForProjectFilterOptions',
  });

  const rowLinkTo = useCallback((s: ServiceFields) => {
    return generateSafePath(EnrollmentDashboardRoutes.SERVICES, {
      clientId: s.enrollment.client.id,
      enrollmentId: s.enrollment.id,
    });
  }, []);

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
      rowLinkTo={rowLinkTo}
    />
  );
};
export default ProjectServicesTable;
