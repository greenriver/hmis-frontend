import { Paper, Stack, Typography } from '@mui/material';

import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { formatDateTimeForDisplay } from '@/modules/hmis/hmisUtil';
import {
  GetClientAuditEventsDocument,
  GetClientAuditEventsQuery,
  GetClientAuditEventsQueryVariables,
} from '@/types/gqlTypes';

type AssessmentType = NonNullable<
  NonNullable<GetClientAuditEventsQuery['client']>['auditHistory']
>['nodes'][0];

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Date',
    render: (e) =>
      e.createdAt && formatDateTimeForDisplay(new Date(e.createdAt)),
  },
  {
    header: 'User',
    render: (e) => e.user?.name,
  },
  {
    header: 'Action',
    render: (e) => e.event,
  },
  {
    header: 'changes',
    width: '100%',
    render: (e) => JSON.stringify(e.objectChanges),
  },
];

const History = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>Audit History</Typography>
      </Stack>
      <Paper>
        <GenericTableWithData<
          GetClientAuditEventsQuery,
          GetClientAuditEventsQueryVariables,
          AssessmentType
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAuditEventsDocument}
          columns={columns}
          pagePath='client.auditHistory'
          fetchPolicy='cache-and-network'
          noData='No audit history.'
        />
      </Paper>
    </>
  );
};

export default History;
