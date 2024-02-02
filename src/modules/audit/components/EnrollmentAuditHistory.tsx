import { Paper } from '@mui/material';
import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  AuditHistoryNode,
  auditHistoryColumns,
} from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  EnrollmentAuditEventFilterOptions,
  GetEnrollmentAuditEventsDocument,
  GetEnrollmentAuditEventsQuery,
  GetEnrollmentAuditEventsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<AuditHistoryNode>[] = auditHistoryColumns;

const EnrollmentAuditHistory = () => {
  const { enrollmentId } = useSafeParams() as { enrollmentId: string };

  return (
    <ContextualCollapsibleListsProvider>
      <PageTitle title='Enrollment Audit History' />
      <Paper>
        <GenericTableWithData<
          GetEnrollmentAuditEventsQuery,
          GetEnrollmentAuditEventsQueryVariables,
          AuditHistoryNode,
          EnrollmentAuditEventFilterOptions
        >
          columns={columns}
          fetchPolicy='cache-and-network'
          // Hide rows that don't have any changes. It would be better if we can do this on the backend, the pagination counts are off
          filterRows={(row) =>
            row.objectChanges && Object.keys(row.objectChanges).length > 0
          }
          noData='No audit history'
          pagePath='enrollment.auditHistory'
          paginationItemName='event'
          queryDocument={GetEnrollmentAuditEventsDocument}
          queryVariables={{ id: enrollmentId }}
          rowSx={() => ({ whiteSpace: 'nowrap' })}
          tableProps={{ sx: { tableLayout: 'fixed' } }}
          recordType='EnrollmentAuditEvent'
          filterInputType='EnrollmentAuditEventFilterOptions'
          showFilters
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default EnrollmentAuditHistory;
