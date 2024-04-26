import React from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import { useFilters } from '@/modules/hmis/filterUtil';
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
  const filters = useFilters({
    type: 'ClientAccessSummaryFilterOptions',
    omit: ['searchTerm'],
  });

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
      defaultFilterValues={{
        onOrAfter: startDate,
      }}
      columns={columns}
      pagePath='user.clientAccessSummaries'
      noData='No access history'
      paginationItemName='accessed client'
      recordType='ClientAccessSummary'
      filters={filters}
      showTopToolbar
    />
  );
};

export default ClientAccessSummaryTable;
