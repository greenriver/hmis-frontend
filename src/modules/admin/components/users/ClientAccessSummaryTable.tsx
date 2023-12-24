import React from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  clientNameAllParts,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ClientAccessSummaryFieldsFragment,
  GetUserClientSummariesDocument,
  GetUserClientSummariesQuery,
  GetUserClientSummariesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<ClientAccessSummaryFieldsFragment>[] = [
  {
    header: 'Client Name',
    render: ({ client }) => (client ? clientNameAllParts(client) : undefined),
  },
  {
    header: 'Last Accessed',
    render: ({ lastAccessedAt }) => parseAndFormatDateTime(lastAccessedAt),
  },
  {
    header: 'Client ID',
    render: ({ client }) => client?.id,
  },
];

interface Props {
  userId: string;
}
const ClientAccessSummaryTable: React.FC<Props> = ({ userId }) => {
  return (
    <GenericTableWithData<
      GetUserClientSummariesQuery,
      GetUserClientSummariesQueryVariables,
      ClientAccessSummaryFieldsFragment
    >
      queryVariables={{ id: userId }}
      queryDocument={GetUserClientSummariesDocument}
      columns={columns}
      pagePath='user.clientAccessSummaries'
      noData='No access history'
    />
  );
};

export default ClientAccessSummaryTable;
