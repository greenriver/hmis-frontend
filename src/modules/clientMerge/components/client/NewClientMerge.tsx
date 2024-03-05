import { Button, Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientMergeDetailsTable from '../ClientMergeDetailsTable';
import BackButtonLink from '@/components/elements/BackButtonLink';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import RouterLink from '@/components/elements/RouterLink';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import ClientTextSearchForm from '@/modules/search/components/ClientTextSearchForm';
import { ClientDashboardRoutes, Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientFieldsFragment,
  ClientSortOption,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
  useMergeClientsMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const NewClientMerge = () => {
  const { client } = useClientDashboardContext();
  const [searchTerm, setSearchTerm] = useState<string>('');
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
      {
        header: 'Gender',
        render: (client: ClientFieldsFragment) => (
          <MultiHmisEnum values={client.gender} enumMap={HmisEnums.Gender} />
        ),
      },
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
        <BackButtonLink
          to={generateSafePath(ClientDashboardRoutes.MERGE_HISTORY, {
            clientId: client.id,
          })}
        >
          Back to Merge History
        </BackButtonLink>

        <TitleCard title='Merge Client Records'>
          <Stack gap={6}>
            <Grid container alignItems={'flex-start'}>
              <Grid item xs={12} lg={6} sx={{ px: 2, py: 2 }}>
                <ClientTextSearchForm
                  onSearch={(text) => setSearchTerm(text)}
                  onClearSearch={() => setSearchTerm('')}
                />
              </Grid>
              <Grid item xs></Grid>
            </Grid>

            {searchTerm && (
              <SsnDobShowContextProvider>
                <GenericTableWithData<
                  SearchClientsQuery,
                  SearchClientsQueryVariables,
                  ClientFieldsFragment
                >
                  queryVariables={{ input: { textSearch: searchTerm } }}
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
