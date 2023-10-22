import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useState } from 'react';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import ExternalLink from '@/components/elements/ExternalLink';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import {
  ContextualClientDobAge,
  ContextualClientSsn,
  ContextualDobToggleButton,
  ContextualSsnToggleButton,
  SsnDobShowContextProvider,
} from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  GetMergeCandidatesDocument,
  GetMergeCandidatesQuery,
  GetMergeCandidatesQueryVariables,
  useBulkMergeClientsMutation,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

type MergeCandidateFragment = NonNullable<
  NonNullable<GetMergeCandidatesQuery>['mergeCandidates']['nodes'][number]
>;

const ClientMergeCandidatesTable: React.FC = () => {
  const columns: ColumnDef<MergeCandidateFragment>[] = [
    {
      header: 'Warehouse ID',
      render: ({ id, warehouseUrl }) => (
        <ExternalLink href={warehouseUrl}>{id}</ExternalLink>
      ),
    },
    {
      header: 'Client IDs',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <span key={client.id}>{client.id}</span>
          ))}
        </Stack>
      ),
    },
    {
      header: 'Client Names',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <ClientName
              client={client}
              key={client.id}
              nameParts='full_name'
              linkToProfile
            />
          ))}
        </Stack>
      ),
    },
    {
      header: (
        <Stack direction='row' justifyContent='space-between'>
          <ContextualDobToggleButton
            sx={{ p: 0 }}
            variant='text'
            size='small'
          />
        </Stack>
      ),
      key: 'dob',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <ContextualClientDobAge key={client.id} client={client} />
          ))}
        </Stack>
      ),
    },
    {
      header: (
        <ContextualSsnToggleButton sx={{ p: 0 }} variant='text' size='small' />
      ),
      key: 'ssn',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <ContextualClientSsn key={client.id} client={client} />
          ))}
        </Stack>
      ),
    },
  ];

  const [mergesToApply, setMergesToApply] = useState<MergeCandidateFragment[]>(
    []
  );

  const [bulkMergeClients, { error, loading }] = useBulkMergeClientsMutation({
    onCompleted: () => {
      setMergesToApply([]);
      evictQuery('mergeCandidates');
    },
  });

  const handleConfirm = useCallback(() => {
    const merges = mergesToApply.map(({ clients }) => ({
      clientIds: clients.map((c) => c.id),
    }));

    bulkMergeClients({ variables: { input: { input: merges } } });
  }, [bulkMergeClients, mergesToApply]);

  if (error) throw error;

  return (
    <>
      <SsnDobShowContextProvider>
        <GenericTableWithData<
          GetMergeCandidatesQuery,
          GetMergeCandidatesQueryVariables,
          MergeCandidateFragment
        >
          queryVariables={{}}
          queryDocument={GetMergeCandidatesDocument}
          columns={columns}
          pagePath='mergeCandidates'
          noData='No candidates for merge'
          selectable='checkbox'
          EnhancedTableToolbarProps={{
            title: 'Merge Candidates',
            renderBulkAction: (_selectedWarehouseIds, selectedRows) => (
              <Button onClick={() => setMergesToApply(selectedRows)}>
                Perform ({selectedRows.length}) Merges
              </Button>
            ),
          }}
        />
      </SsnDobShowContextProvider>
      <ConfirmationDialog
        id='confirmMerges'
        open={mergesToApply.length > 0}
        title='Are you sure?'
        onConfirm={handleConfirm}
        onCancel={() => setMergesToApply([])}
        loading={loading}
        maxWidth='sm'
        fullWidth
      >
        Source records for the following clients will be merged:
        <ul>
          {mergesToApply.map(({ id, clients }) => (
            <li key={id}>
              <b>{clientBriefName(clients[0])}</b>
              {` (${clients.length} records)`}
            </li>
          ))}
        </ul>
      </ConfirmationDialog>
    </>
  );
};

export default ClientMergeCandidatesTable;
