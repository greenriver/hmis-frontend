import { Paper } from '@mui/material';
import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  AuditHistoryNode,
  auditHistoryColumns,
} from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  ClientAuditEventFilterOptions,
  GetClientAuditEventsDocument,
  GetClientAuditEventsQuery,
  GetClientAuditEventsQueryVariables,
} from '@/types/gqlTypes';

const ClientAuditHistory = () => {
  const columns = auditHistoryColumns.filter(
    (column) =>
      !column.key || !['clientName', 'projectName'].includes(column.key)
  );

  const { clientId } = useSafeParams() as { clientId: string };

  return (
    <ContextualCollapsibleListsProvider>
      <PageTitle title='Client Audit History' />
      <Paper>
        <GenericTableWithData<
          GetClientAuditEventsQuery,
          GetClientAuditEventsQueryVariables,
          AuditHistoryNode,
          ClientAuditEventFilterOptions
        >
          columns={columns}
          fetchPolicy='cache-and-network'
          // Hide rows that don't have any changes. It would be better if we can do this on the backend, the pagination counts are off
          filterRows={(row) =>
            row.objectChanges && Object.keys(row.objectChanges).length > 0
          }
          noData='No audit history'
          pagePath='client.auditHistory'
          paginationItemName='event'
          queryDocument={GetClientAuditEventsDocument}
          queryVariables={{ id: clientId }}
          rowSx={() => ({ whiteSpace: 'nowrap' })}
          tableProps={{ sx: { tableLayout: 'fixed' } }}
          recordType='ClientAuditEvent'
          filterInputType='ClientAuditEventFilterOptions'
          showFilters
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default ClientAuditHistory;
