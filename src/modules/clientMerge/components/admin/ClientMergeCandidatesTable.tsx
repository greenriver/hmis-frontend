import { Button, Chip, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import pluralize from 'pluralize';
import { ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientMergeDetailsTable from '../ClientMergeDetailsTable';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import ExternalLink from '@/components/elements/ExternalLink';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
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
import { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetMergeCandidatesDocument,
  GetMergeCandidatesQuery,
  GetMergeCandidatesQueryVariables,
  useBulkMergeClientsMutation,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

export type MergeCandidateFragment = NonNullable<
  NonNullable<GetMergeCandidatesQuery>['mergeCandidates']['nodes'][number]
>;

const TableCellRows = ({ rows }: { rows: ReactNode[] }) => (
  <Stack direction='column' gap={1} sx={{ py: 1 }}>
    {rows.map((row) => row || <>&#160;</>)}
  </Stack>
);

const ClientMergeCandidatesTable: React.FC = () => {
  const columns: ColumnDef<MergeCandidateFragment>[] = [
    {
      header: 'Warehouse ID',
      render: ({ id, warehouseUrl }) => (
        <ExternalLink href={warehouseUrl}>{id}</ExternalLink>
      ),
    },
    {
      header: 'HMIS ID',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <span key={client.id}>{client.id}</span>
          ))}
        </Stack>
      ),
    },
    {
      header: 'Client Name',
      render: ({ clients }) => (
        <Stack direction='column' gap={1} sx={{ py: 1 }}>
          {clients.map((client) => (
            <ClientName
              client={client}
              key={client.id}
              nameParts='full_name'
              linkToProfile
              routerLinkProps={{ openInNew: true }}
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
        <TableCellRows
          rows={clients.map((client) =>
            client.dob ? (
              <ContextualClientDobAge key={client.id} client={client} />
            ) : null
          )}
        />
      ),
    },
    {
      header: (
        <ContextualSsnToggleButton sx={{ p: 0 }} variant='text' size='small' />
      ),
      key: 'ssn',
      render: ({ clients }) => (
        <TableCellRows
          rows={clients.map((client) =>
            client.ssn ? (
              <ContextualClientSsn key={client.id} client={client} />
            ) : null
          )}
        />
      ),
    },
    {
      header: 'Gender',
      key: 'gender',
      render: ({ clients }) => (
        <TableCellRows
          rows={clients.map(({ id, gender }) => (
            <MultiHmisEnum
              key={id}
              values={gender}
              enumMap={HmisEnums.Gender}
              noData={<>&#160;</>}
              sx={{ whiteSpace: 'nowrap' }}
            />
          ))}
        />
      ),
    },
  ];

  const [mergesToApply, setMergesToApply] = useState<MergeCandidateFragment[]>(
    []
  );

  const navigate = useNavigate();

  const [bulkMergeClients, { error, loading }] = useBulkMergeClientsMutation({
    onCompleted: () => {
      setMergesToApply([]);
      evictQuery('mergeCandidates');
      navigate(AdminDashboardRoutes.CLIENT_MERGE_HISTORY);
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
          noData='No potential duplicates found'
          selectable='checkbox'
          EnhancedTableToolbarProps={{
            title: 'Candidates for Review',
            renderBulkAction: (_selectedWarehouseIds, selectedRows) => (
              <Button onClick={() => setMergesToApply(selectedRows)}>
                {`Perform (${selectedRows.length}) Merge${
                  selectedRows.length > 1 ? 's' : ''
                }`}
              </Button>
            ),
          }}
        />
      </SsnDobShowContextProvider>
      {mergesToApply.length > 0 && (
        <ConfirmationDialog
          id='confirmMerges'
          open
          title={mergesToApply.length > 1 ? 'Confirm Merges' : 'Confirm Merge'}
          onConfirm={handleConfirm}
          onCancel={() => setMergesToApply([])}
          loading={loading}
          maxWidth='md'
          confirmText={`Apply (${mergesToApply.length}) Merge${
            mergesToApply.length > 1 ? 's' : ''
          }`}
          fullWidth
        >
          <SimpleAccordion
            renderHeader={(header) => header}
            renderContent={(content) => content}
            AccordionProps={{ defaultExpanded: mergesToApply.length < 3 }}
            AccordionDetailsProps={{ sx: { px: 0, pb: 0 } }}
            items={mergesToApply.map(({ id, clients }) => {
              return {
                key: id,
                header: (
                  <Stack
                    direction='row'
                    gap={1}
                    justifyContent='space-between'
                    width='99%'
                  >
                    <Typography fontWeight={800}>
                      {clientBriefName(clients[0])}
                    </Typography>
                    <Chip
                      label={pluralize('record', clients.length, true)}
                      variant='outlined'
                      size='small'
                    />
                  </Stack>
                ),
                content: (
                  <Box>
                    <ClientMergeDetailsTable clients={clients} />
                  </Box>
                ),
              };
            })}
          />
        </ConfirmationDialog>
      )}
    </>
  );
};

export default ClientMergeCandidatesTable;
