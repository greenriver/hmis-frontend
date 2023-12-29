import { omit } from 'lodash-es';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
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
    render: ({ lastAccessedAt }) => parseAndFormatDateTime(lastAccessedAt),
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
      defaultFilters={{ onOrAfter: startDate }}
      queryDocument={GetUserEnrollmentSummariesDocument}
      columns={columns}
      pagePath='user.enrollmentAccessSummaries'
      noData='No access history'
      filterInputType='EnrollmentAccessSummaryFilterOptions'
      recordType='access events'
      filters={(filters) => omit(filters, 'searchTerm')}
      showFilters
    />
  );
};

export default EnrollmentAccessSummaryTable;
