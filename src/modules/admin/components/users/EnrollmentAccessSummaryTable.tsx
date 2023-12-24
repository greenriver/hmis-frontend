import React from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  clientNameAllParts,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  EnrollmentAccessSummaryFieldsFragment,
  GetUserEnrollmentSummariesDocument,
  GetUserEnrollmentSummariesQuery,
  GetUserEnrollmentSummariesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EnrollmentAccessSummaryFieldsFragment>[] = [
  {
    header: 'Client Name',
    render: ({ enrollment }) =>
      enrollment?.client ? clientNameAllParts(enrollment?.client) : undefined,
  },
  {
    header: 'Last Accessed',
    render: ({ lastAccessedAt }) => parseAndFormatDateTime(lastAccessedAt),
  },
  {
    header: 'Client ID',
    render: ({ enrollment }) => enrollment?.client?.id,
  },
  {
    header: 'Project ID',
    render: ({ enrollment }) => enrollment?.project?.id,
  },
  {
    header: 'Project Name',
    render: ({ enrollment }) => enrollment?.project?.projectName,
  },
];

interface Props {
  userId: string;
}
const EnrollmentAccessSummaryTable: React.FC<Props> = ({ userId }) => {
  return (
    <GenericTableWithData<
      GetUserEnrollmentSummariesQuery,
      GetUserEnrollmentSummariesQueryVariables,
      EnrollmentAccessSummaryFieldsFragment
    >
      queryVariables={{ id: userId }}
      queryDocument={GetUserEnrollmentSummariesDocument}
      columns={columns}
      pagePath='user.enrollmentAccessSummaries'
      noData='No access history'
    />
  );
};

export default EnrollmentAccessSummaryTable;
