import useSafeParams from '@/hooks/useSafeParams';
import {
  AuditHistoryNode,
  auditHistoryColumns,
} from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  UserAuditEventFilterOptions,
  GetUserAuditEventsDocument,
  GetUserAuditEventsQuery,
  GetUserAuditEventsQueryVariables,
} from '@/types/gqlTypes';

const UserAuditHistory = () => {
  const { userId } = useSafeParams() as { userId: string };
  // On the user audit history page, we don't need to show the user column, since the value will always be the same
  const columns = auditHistoryColumns.filter((column) => column.key !== 'user');

  return (
    <GenericTableWithData<
      GetUserAuditEventsQuery,
      GetUserAuditEventsQueryVariables,
      AuditHistoryNode,
      UserAuditEventFilterOptions
    >
      columns={columns}
      fetchPolicy='cache-and-network'
      noData='No audit history'
      pagePath='user.auditHistory'
      paginationItemName='event'
      queryDocument={GetUserAuditEventsDocument}
      queryVariables={{ id: userId }}
      rowSx={() => ({ whiteSpace: 'nowrap' })}
      tableProps={{ sx: { tableLayout: 'fixed' } }}
      recordType='user audit event'
      filterInputType='UserAuditEventFilterOptions'
      showFilters
    />
  );
};

export default UserAuditHistory;
