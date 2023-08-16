import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { SERVICE_COLUMNS } from '@/modules/enrollment/components/dashboardPages/EnrollmentServicesPage';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetProjectServicesDocument,
  GetProjectServicesQuery,
  GetProjectServicesQueryVariables,
  ServicesForProjectFilterOptions,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export type ServiceFields = NonNullable<
  GetProjectServicesQuery['project']
>['services']['nodes'][number];

const COLUMNS: ColumnDef<ServiceFields>[] = [
  {
    header: 'Client',
    linkTreatment: true,
    render: (s) => <ClientName client={s.enrollment.client} />,
  },
  {
    header: 'Enrollment Period',
    render: (s) =>
      parseAndFormatDateRange(s.enrollment.entryDate, s.enrollment.exitDate),
  },
  ...SERVICE_COLUMNS.map((c) => {
    if (c.header === 'Date Provided') return { ...c, linkTreatment: false };
    return c;
  }),
];

const ProjectServicesTable = ({
  projectId,
  columns,
}: {
  projectId: string;
  columns?: typeof COLUMNS;
}) => {
  const rowLinkTo = useCallback(
    (service: ServiceFields) =>
      generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId: service.enrollment.client.id,
        enrollmentId: service.enrollment.id,
      }),
    []
  );

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
      columns={columns || COLUMNS}
      rowLinkTo={rowLinkTo}
      noData='No services'
      pagePath='project.services'
      recordType='Service'
      showFilters
      filterInputType='ServicesForProjectFilterOptions'
    />
  );
};
export default ProjectServicesTable;
