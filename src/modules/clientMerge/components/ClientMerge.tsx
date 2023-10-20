import { Button, Grid, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { CommonCard } from '@/components/elements/CommonCard';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
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
import generateSafePath from '@/utils/generateSafePath';

const ClientMerge = () => {
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
          generateSafePath(ClientDashboardRoutes.CLIENT_MERGES, {
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

  const columns = useMemo(() => {
    return [
      {
        header: 'HMIS ID',
        render: ({ id }: ClientFieldsFragment) => (
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
      ,
      HudRecordMetadataHistoryColumn,
      {
        key: 'mergeAction',
        render: (record: ClientFieldsFragment) =>
          record.id === client.id ? (
            <Typography textAlign='center' color='text.disabled'>
              Current Client
            </Typography>
          ) : (
            <Button fullWidth onClick={() => setCandidate(record)}>
              Merge
            </Button>
          ),
      },
    ];
  }, [client.id]);

  return (
    <>
      <PageTitle title='Client Merge' />
      {/* TODO: show merge history */}
      <CommonCard title='Client Search'>
        <Stack gap={6}>
          <Grid container alignItems={'flex-start'}>
            <Grid item xs={12} md={9} lg={8}>
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
                columns={columns as ColumnDef<ClientFieldsFragment>[]}
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
      </CommonCard>
      {/* TODO: show more information about clients, for example demographics and/or some enrollment history */}
      <ConfirmationDialog
        id='confirmMerge'
        open={!!candidate}
        title='Are you sure?'
        onConfirm={handleConfirm}
        onCancel={() => setCandidate(undefined)}
        loading={loading}
        maxWidth='sm'
        fullWidth
      >
        The following clients will be merged:
        <ul>
          {[client, candidate].map((curr) =>
            curr ? (
              <li key={curr.id}>
                <RouterLink
                  to={generateSafePath(Routes.CLIENT_DASHBOARD, {
                    clientId: curr.id,
                  })}
                  openInNew
                  variant='body1'
                >
                  Client {curr.id}: {clientNameAllParts(curr)}
                </RouterLink>
              </li>
            ) : null
          )}
        </ul>
      </ConfirmationDialog>
    </>
  );
};

export default ClientMerge;
