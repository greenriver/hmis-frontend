import React from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  ClientAccessSummaryFieldsFragment,
  GetUserClientSummariesDocument,
  GetUserClientSummariesQuery,
  GetUserClientSummariesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<ClientAccessSummaryFieldsFragment>[] = [
  {
    header: 'Client Name',
    render: 'clientName',
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
  startDate: string;
}
const ClientAccessSummaryTable: React.FC<Props> = ({ userId, startDate }) => {
  return (
    <GenericTableWithData<
      GetUserClientSummariesQuery,
      GetUserClientSummariesQueryVariables,
      ClientAccessSummaryFieldsFragment
    >
      queryVariables={{ id: userId }}
      queryDocument={GetUserClientSummariesDocument}
      defaultFilters={{ onOrAfter: startDate }}
      columns={columns}
      pagePath='user.clientAccessSummaries'
      noData='No access history'
      filterInputType='ClientAccessSummaryFilterOptions'
      recordType='access events'
      showFilters
    />
  );
};

export default ClientAccessSummaryTable;
