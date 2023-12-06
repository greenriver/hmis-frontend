import { Button, Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientMergeDetailsTable from '../ClientMergeDetailsTable';
import BackButton from '@/components/elements/BackButton';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import RouterLink from '@/components/elements/RouterLink';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { ClientTextSearchInputForm } from '@/modules/search/components/ClientTextSearchInput';
import { ClientDashboardRoutes, Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientSearchInput,
  ClientSortOption,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
  useMergeClientsMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const NewClientMerge = () => {
  const { client } = useClientDashboardContext();
  const [searchInput, setSearchInput] = useState<ClientSearchInput>();
  const [candidate, setCandidate] = useState<
    ClientFieldsFragment | undefined
  >();
  const navigate = useNavigate();

  const [mutation, { error, loading }] = useMergeClientsMutation({
    onCompleted: (data) => {
      setCandidate(undefined);
      setSearchInput(undefined);
      const retainedClientId = data.mergeClients?.client?.id;
      if (retainedClientId && retainedClientId !== client.id) {
        navigate(
          generateSafePath(ClientDashboardRoutes.MERGE_HISTORY, {
            clientId: retainedClientId,
          })
        );
      }
    },
  });

  const handleConfirm = useCallback(() => {
    if (!candidate) return;

    mutation({
      variables: { input: { clientIds: [client.id, candidate.id] } },
    });
  }, [candidate, client.id, mutation]);

  if (error) throw error;

  const clientColumns: ColumnDef<ClientFieldsFragment>[] = useMemo(
    () => [
      {
        header: 'HMIS ID',
        render: ({ id }: ClientFieldsFragment) =>
          id === client.id ? (
            id
          ) : (
            <RouterLink
              to={generateSafePath(Routes.CLIENT_DASHBOARD, {
                clientId: id,
              })}
              openInNew
            >
              {id}
            </RouterLink>
          ),
      },
      CLIENT_COLUMNS.first,
      CLIENT_COLUMNS.last,
      { ...CLIENT_COLUMNS.ssn, width: '150px' },
      { ...CLIENT_COLUMNS.dobAge, width: '180px' },
      HudRecordMetadataHistoryColumn,
    ],
    [client.id]
  );

  const columns = useMemo(() => {
    return [
      ...clientColumns,
      {
        key: 'mergeAction',
        render: (record: ClientFieldsFragment) =>
          record.id === client.id ? (
            <Typography
              textAlign='center'
              color='text.disabled'
              variant='body2'
            >
              Current Client
            </Typography>
          ) : (
            <Button fullWidth onClick={() => setCandidate(record)}>
              Merge
            </Button>
          ),
      },
    ];
  }, [client.id, clientColumns]);

  return (
    <>
      <PageTitle title='Merge Clients' />
      <Stack gap={4}>
        <TitleCard title='Current Client Record'>
          <SsnDobShowContextProvider>
            <GenericTable<ClientFieldsFragment>
              columns={clientColumns}
              rows={[client]}
            />
          </SsnDobShowContextProvider>
        </TitleCard>
        <BackButton
          to={generateSafePath(ClientDashboardRoutes.MERGE_HISTORY, {
            clientId: client.id,
          })}
        >
          Back to Merge History
        </BackButton>

        <TitleCard title='Merge Client Records'>
          <Stack gap={6}>
            <Grid container alignItems={'flex-start'}>
              <Grid item xs={12} md={9} lg={8} sx={{ px: 2, py: 2 }}>
                <ClientTextSearchInputForm
                  onSearch={(text) => setSearchInput({ textSearch: text })}
                  searchAdornment
                  minChars={3}
                />
              </Grid>
              <Grid item xs></Grid>
            </Grid>

            {searchInput && (
              <SsnDobShowContextProvider>
                <GenericTableWithData<
                  SearchClientsQuery,
                  SearchClientsQueryVariables,
                  ClientFieldsFragment
                >
                  queryVariables={{ input: searchInput }}
                  queryDocument={SearchClientsDocument}
                  columns={columns}
                  pagePath='clientSearch'
                  fetchPolicy='cache-and-network'
                  showFilters
                  recordType='Client'
                  filterInputType='ClientFilterOptions'
                  defaultSortOption={ClientSortOption.BestMatch}
                />
              </SsnDobShowContextProvider>
            )}
          </Stack>
        </TitleCard>
      </Stack>
      {candidate && (
        <ConfirmationDialog
          id='confirmMerge'
          open
          title='Merge Client Records'
          onConfirm={handleConfirm}
          onCancel={() => setCandidate(undefined)}
          loading={loading}
          maxWidth='sm'
          confirmText='Merge Records'
          fullWidth
        >
          <Box sx={{ py: 4 }}>
            <ClientMergeDetailsTable clients={[client, candidate]} />
          </Box>
        </ConfirmationDialog>
      )}
    </>
  );
};

export default NewClientMerge;
