import { Paper, Stack, Typography } from '@mui/material';
import { compact, filter } from 'lodash-es';
import AuditObjectChangesSummary, {
  ObjectChangesType,
} from './AuditObjectChangesSummary';
import {
  ContextualCollapsibleList,
  ContextualCollapsibleListsProvider,
  ContextualListExpansionButton,
} from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import { auditActionForDisplay } from '@/modules/hmis/hmisUtil';
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
  {
    header: 'Timestamp',
    width: '180px',
    render: (e) => (
      <RelativeDateTableCellContents dateTimeString={e.createdAt} />
    ),
  },
  {
    header: 'User',
    width: '180px',
    render: ({ user, trueUser }) =>
      compact([trueUser?.name, user?.name]).join(' acting as '),
  },
  {
    header: 'Action',
    width: '100px',
    render: ({ event }) => auditActionForDisplay(event),
  },
  {
    header: 'Record Type',
    width: '180px',
    render: ({ recordName, recordId }) => {
      return (
        <Stack>
          <Typography variant='inherit'>{recordName}</Typography>
          <Typography
            color='text.secondary'
            variant='inherit'
          >{`ID: ${recordId}`}</Typography>
        </Stack>
      );
    },
  },
  {
    header: (
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <strong>Fields Changed</strong>
        <ContextualListExpansionButton />
      </Stack>
    ),
    tableCellProps: {
      sx: { p: 0, backgroundColor: (theme) => theme.palette.grey[50] },
    },
    render: (e) => {
      if (!e.objectChanges || Object.keys(e.objectChanges).length === 0) {
        return null;
      }

      const labels = Object.values(e.objectChanges as ObjectChangesType)
        .filter((r) => filter(r.values, hasMeaningfulValue).length > 0)
        .map((val) => val.displayName);

      return (
        <ContextualCollapsibleList title={labels.join(', ')}>
          <AuditObjectChangesSummary
            objectChanges={e.objectChanges as ObjectChangesType}
            recordType={e.graphqlType}
            eventType={e.event}
          />
        </ContextualCollapsibleList>
      );
    },
  },
];

const EnrollmentAuditHistory = () => {
  const { enrollmentId } = useSafeParams() as { enrollmentId: string };

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
          filterInputType='EnrollmentAuditEventFilterOptions'
          showFilters
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default EnrollmentAuditHistory;
