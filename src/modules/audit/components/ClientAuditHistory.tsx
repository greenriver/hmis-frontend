import { Paper, Stack, Typography } from '@mui/material';
import { capitalize, filter } from 'lodash-es';
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
import { formatDateTimeForDisplay } from '@/modules/hmis/hmisUtil';
import {
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
    render: (e) => e.user?.name,
  },
  {
    header: 'Action',
    width: '220px',
    render: (e) => {
      const action = `${capitalize(e.event)} ${e.recordName}`;
      if (e.recordName === 'Client') return action;
      return (
        <Stack>
          <Typography variant='inherit'>{action}</Typography>
          <Typography
            color='text.secondary'
            variant='inherit'
          >{`ID: ${e.recordId}`}</Typography>
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
      if (!e.objectChanges) return null;

      // This is not helpful, these should not be returned from the API
      if (Object.keys(e.objectChanges).length === 0) return null;

      const labels = Object.values(e.objectChanges as ObjectChangesType)
        .filter((r) => filter(r.values, hasMeaningfulValue).length > 0)
        .map((val) => val.displayName);

      return (
        <ContextualCollapsibleList title={labels.join(', ')}>
          <AuditObjectChangesSummary
            objectChanges={e.objectChanges as ObjectChangesType}
            recordType={e.graphqlType}
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
          AuditHistoryType
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAuditEventsDocument}
          columns={columns}
          pagePath='client.auditHistory'
          fetchPolicy='cache-and-network'
          noData='No audit history'
          rowSx={() => ({ whiteSpace: 'nowrap' })}
          tableProps={{ sx: { tableLayout: 'fixed' } }}
        />
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default ClientAuditHistory;
