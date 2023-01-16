import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import ClientName from '@/components/elements/ClientName';
import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

const ProjectEnrollmentsTable = ({ projectId }: { projectId: string }) => {
  const columns: ColumnDef<EnrollmentFieldsFragment>[] = [
    {
      header: 'Client Name',
      render: (e) => <ClientName client={e.client} />,
    },
    {
      header: 'Status',
      render: (e) => <EnrollmentStatus enrollment={e} />,
    },
    {
      header: 'Enrollment Period',
      render: (e) => parseAndFormatDateRange(e.entryDate, e.exitDate),
    },
    {
      header: 'Household Size',
      render: (e) => e.householdSize,
    },
  ];

  const rowLinkTo = useCallback(
    (en: EnrollmentFieldsFragment) =>
      generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
        clientId: en.client.id,
        enrollmentId: en.id,
      }),
    []
  );

  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      EnrollmentFieldsFragment
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectEnrollmentsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No clients.'
      pagePath='project.enrollments'
    />
  );
};
export default ProjectEnrollmentsTable;
