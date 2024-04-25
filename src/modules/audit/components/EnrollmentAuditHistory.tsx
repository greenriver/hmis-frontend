import { Paper } from '@mui/material';
import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  AUDIT_HISTORY_COLUMNS,
  AUDIT_HISTORY_USER_COLUMNS,
} from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  getInputTypeForRecordType,
  useFilters,
} from '@/modules/hmis/filterUtil';
import {
  EnrollmentAuditEventFilterOptions,
  GetEnrollmentAuditEventsDocument,
  GetEnrollmentAuditEventsQuery,
  GetEnrollmentAuditEventsQueryVariables,
} from '@/types/gqlTypes';

type AuditHistoryType = NonNullable<
  NonNullable<GetEnrollmentAuditEventsQuery['enrollment']>['auditHistory']
>['nodes'][0];

const columns: ColumnDef<AuditHistoryType>[] = [
  AUDIT_HISTORY_COLUMNS.timestamp,
  AUDIT_HISTORY_USER_COLUMNS.user,
  AUDIT_HISTORY_COLUMNS.action,
  AUDIT_HISTORY_COLUMNS.recordType,
  AUDIT_HISTORY_COLUMNS.fieldsChanged,
];

const EnrollmentAuditHistory = () => {
  const { enrollmentId } = useSafeParams() as { enrollmentId: string };
  const filters = useFilters({
    type: getInputTypeForRecordType('EnrollmentAuditEvent'),
  });

  return (
    <ContextualCollapsibleListsProvider>
      <PageTitle title='Enrollment Audit History' />
      <Paper>
        <GenericTableWithData<
          GetEnrollmentAuditEventsQuery,
          GetEnrollmentAuditEventsQueryVariables,
          AuditHistoryType,
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
          filters={filters}
          showFilters
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default EnrollmentAuditHistory;
