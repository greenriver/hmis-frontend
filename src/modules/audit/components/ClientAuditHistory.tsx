import { Paper, Stack, Typography } from '@mui/material';
import { compact, filter, omit } from 'lodash-es';
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
import {
  auditActionForDisplay,
  formatDateTimeForDisplay,
} from '@/modules/hmis/hmisUtil';
import {
  BaseAuditEventFilterOptions,
  GetClientAuditEventsDocument,
  GetClientAuditEventsQuery,
  GetClientAuditEventsQueryVariables,
} from '@/types/gqlTypes';

type AuditHistoryType = NonNullable<
  NonNullable<GetClientAuditEventsQuery['client']>['auditHistory']
>['nodes'][0];

const columns: ColumnDef<AuditHistoryType>[] = [
  {
    header: 'Timestamp',
    width: '180px',
    render: (e) =>
      e.createdAt && formatDateTimeForDisplay(new Date(e.createdAt)),
  },
  {
    header: 'User',
    width: '180px',
    render: ({ user, trueUser }) =>
      compact([trueUser?.name, user?.name]).join(' acting as ') ||
      'System User',
  },
  {
    header: 'Action',
    width: '100px',
    render: ({ event }) => auditActionForDisplay(event),
  },
  {
    header: 'Record Type',
    width: '150px',
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

const ClientAuditHistory = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  return (
    <ContextualCollapsibleListsProvider>
      <PageTitle title='Client Audit History' />
      <Paper>
        <GenericTableWithData<
          GetClientAuditEventsQuery,
          GetClientAuditEventsQueryVariables,
          AuditHistoryType,
          BaseAuditEventFilterOptions
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
          // FIXME: Record dropdown is non specific to Clients
          filters={(filters) => omit(filters, 'auditEventRecordType')}
          recordType='ClientAuditEvent'
          filterInputType='BaseAuditEventFilterOptions'
          showFilters
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default ClientAuditHistory;
