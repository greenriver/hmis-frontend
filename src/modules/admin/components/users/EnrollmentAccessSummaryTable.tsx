import { ColumnDef } from '@/components/elements/table/types';
import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
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
    key: 'projectName',
  },
  {
    header: 'Client Name',
    render: 'clientName',
    key: 'clientName',
  },
  {
    header: 'Enrollment ID',
    render: 'enrollmentId',
    key: 'enrollmentId',
  },
  {
    header: 'Client ID',
    render: 'clientId',
    key: 'clientId',
  },
  {
    header: 'Last Accessed',
    key: 'lastAccessed',
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
  searchTerm?: string;
}
const EnrollmentAccessSummaryTable: React.FC<Props> = ({
  userId,
  searchTerm,
}) => {
  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'EnrollmentAccessSummaryFilterOptions',
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
      queryDocument={GetUserEnrollmentSummariesDocument}
      columns={columns}
      pagePath='user.enrollmentAccessSummaries'
      noData='No access history'
      paginationItemName='accessed enrollment'
      recordType='EnrollmentAccessSummary'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    />
  );
};

export default EnrollmentAccessSummaryTable;
