import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import { AUDIT_HISTORY_COLUMNS } from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { Routes } from '@/routes/routes';
import {
  UserAuditEventFilterOptions,
  GetUserAuditEventsDocument,
  GetUserAuditEventsQuery,
  GetUserAuditEventsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type AuditHistoryType = NonNullable<
  NonNullable<GetUserAuditEventsQuery['user']>['auditHistory']
>['nodes'][0];

const columns: ColumnDef<AuditHistoryType>[] = [
  AUDIT_HISTORY_COLUMNS.timestamp,
  {
    header: 'Client Name',
    width: '180px',
    render: ({ clientName, clientId }) => {
      if (!clientName) return;
      if (clientName && clientId) {
        return (
          <RouterLink
            to={generateSafePath(Routes.CLIENT_DASHBOARD, {
              clientId: clientId,
            })}
          >
            {clientName}
          </RouterLink>
        );
      }
    },
  },
  {
    header: 'Project Name',
    width: '180px',
    render: ({ projectName, clientId, enrollmentId, projectId }) => {
      if (!projectName) return;
      if (clientId && enrollmentId) {
        return (
          <RouterLink
            to={generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
              enrollmentId,
              clientId,
            })}
          >
            {projectName}
          </RouterLink>
        );
      }
      if (projectId) {
        return (
          <RouterLink to={generateSafePath(Routes.PROJECT, { projectId })}>
            {projectName}
          </RouterLink>
        );
      }
    },
  },
  AUDIT_HISTORY_COLUMNS.action,
  AUDIT_HISTORY_COLUMNS.recordType,
  AUDIT_HISTORY_COLUMNS.fieldsChanged,
];

const UserAuditHistory = () => {
  const { userId } = useSafeParams() as { userId: string };
  const filters = useFilters({
    type: 'UserAuditEventFilterOptions',
  });

  return (
    <>
      <ContextualCollapsibleListsProvider>
        <GenericTableWithData<
          GetUserAuditEventsQuery,
          GetUserAuditEventsQueryVariables,
          AuditHistoryType,
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
          recordType='ApplicationUserAuditEvent'
          filters={filters}
        />
      </ContextualCollapsibleListsProvider>
    </>
  );
};

export default UserAuditHistory;
