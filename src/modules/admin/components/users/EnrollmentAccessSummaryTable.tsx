import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  EnrollmentAccessSummaryFieldsFragment,
  GetUserEnrollmentSummariesDocument,
  GetUserEnrollmentSummariesQuery,
  GetUserEnrollmentSummariesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EnrollmentAccessSummaryFieldsFragment>[] = [
  {
    header: 'Project Name',
    render: 'projectName',
  },
  {
    header: 'Client Name',
    render: 'clientName',
  },
  {
    header: 'Enrollment ID',
    render: 'enrollmentId',
  },
  {
    header: 'Client ID',
    render: 'clientId',
  },
  {
    header: 'Last Accessed',
    render: ({ lastAccessedAt }) => (
      <RelativeDateTableCellContents
        dateTimeString={lastAccessedAt}
        horizontal
      />
    ),
  },
];

interface Props {
  userId: string;
  startDate?: string;
  searchTerm?: string;
}
const EnrollmentAccessSummaryTable: React.FC<Props> = ({
  userId,
  startDate,
  searchTerm,
}) => {
  const filters = useFilters({
    type: 'EnrollmentAccessSummaryFilterOptions',
    omit: ['searchTerm'],
  });

  return (
    <GenericTableWithData<
      GetUserEnrollmentSummariesQuery,
      GetUserEnrollmentSummariesQueryVariables,
      EnrollmentAccessSummaryFieldsFragment
    >
      queryVariables={{
        id: userId,
        filters: { searchTerm },
      }}
      defaultFilterValues={{ onOrAfter: startDate }}
      queryDocument={GetUserEnrollmentSummariesDocument}
      columns={columns}
      pagePath='user.enrollmentAccessSummaries'
      noData='No access history'
      paginationItemName='accessed enrollment'
      recordType='EnrollmentAccessSummary'
      filters={filters}
    />
  );
};

export default EnrollmentAccessSummaryTable;
