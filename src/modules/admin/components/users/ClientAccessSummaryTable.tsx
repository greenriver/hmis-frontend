import { omit } from 'lodash-es';
import React from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
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
const ClientAccessSummaryTable: React.FC<Props> = ({
  userId,
  startDate,
  searchTerm = '',
}) => {
  return (
    <GenericTableWithData<
      GetUserClientSummariesQuery,
      GetUserClientSummariesQueryVariables,
      ClientAccessSummaryFieldsFragment
    >
      queryVariables={{
        id: userId,
        filters: { searchTerm },
      }}
      queryDocument={GetUserClientSummariesDocument}
      defaultFilters={{
        onOrAfter: startDate,
      }}
      columns={columns}
      pagePath='user.clientAccessSummaries'
      noData='No access history'
      filterInputType='ClientAccessSummaryFilterOptions'
      paginationItemName='accessed client'
      recordType='ClientAccessSummary'
      filters={(filters) => omit(filters, 'searchTerm')}
      showFilters
    />
  );
};

export default ClientAccessSummaryTable;
