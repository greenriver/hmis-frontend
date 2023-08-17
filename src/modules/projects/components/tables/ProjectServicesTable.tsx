import { useMemo } from 'react';

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

const ProjectServicesTable = ({
  projectId,
  columns,
}: {
  projectId: string;
  columns?: typeof SERVICE_COLUMNS;
}) => {
  const displayColumns: ColumnDef<ServiceFields>[] = useMemo(() => {
    if (columns) return columns;
    return [
      {
        header: 'Client',
        linkTreatment: true,
        render: (s: ServiceFields) => {
          const viewEnrollmentPath = generateSafePath(
            EnrollmentDashboardRoutes.SERVICES,
            {
              clientId: s.enrollment.client.id,
              enrollmentId: s.enrollment.id,
            }
          );
          return (
            <ClientName
              client={s.enrollment.client}
              routerLinkProps={{ to: viewEnrollmentPath }}
            />
          );
        },
      },
      ...SERVICE_COLUMNS.map((c) => {
        if (c.header === 'Date Provided') return { ...c, linkTreatment: false };
        return c;
      }),
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
      showFilters
      filterInputType='ServicesForProjectFilterOptions'
    />
  );
};
export default ProjectServicesTable;