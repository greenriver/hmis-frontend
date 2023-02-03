import { useCallback, useMemo } from 'react';

import ClientName from '@/components/elements/ClientName';
import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import TextInput from '@/components/elements/input/TextInput';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetProjectEnrollmentsDocument,
  GetProjectEnrollmentsQuery,
  GetProjectEnrollmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const baseColumns: ColumnDef<EnrollmentFieldsFragment>[] = [
  {
    header: 'Client',
    render: (e) => <ClientName client={e.client} />,
    linkTreatment: true,
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

const ProjectEnrollmentsTable = ({
  projectId,
  additionalColumns,
}: {
  projectId: string;
  additionalColumns?: typeof baseColumns;
}) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const rowLinkTo = useCallback(
    (en: EnrollmentFieldsFragment) =>
      generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
        clientId: en.client.id,
        enrollmentId: en.id,
      }),
    []
  );

  const columns = useMemo(
    () => [...baseColumns, ...(additionalColumns || [])],
    [additionalColumns]
  );

  return (
    <GenericTableWithData<
      GetProjectEnrollmentsQuery,
      GetProjectEnrollmentsQueryVariables,
      EnrollmentFieldsFragment
    >
      header={
        <TextInput
          label='Search Clients'
          name='search client'
          placeholder='Search clients...'
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
          inputWidth='200px'
        />
      }
      queryVariables={{ id: projectId, clientSearchTerm: debouncedSearch }}
      queryDocument={GetProjectEnrollmentsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No clients.'
      pagePath='project.enrollments'
    />
  );
};
export default ProjectEnrollmentsTable;
