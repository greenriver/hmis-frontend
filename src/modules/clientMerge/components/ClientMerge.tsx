import { Button, Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo, useState } from 'react';

import { CommonCard } from '@/components/elements/CommonCard';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { ClientTextSearchInputForm } from '@/modules/search/components/ClientTextSearchInput';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientSearchInput,
  ClientSortOption,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ClientMerge = () => {
  // const { client } = useClientDashboardContext;
  const [searchInput, setSearchInput] = useState<ClientSearchInput>();

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
      // {
      //   header: 'Warehouse ID',
      //   render: ({ id }: ClientFieldsFragment) => (
      //     <RouterLink
      //       to={generateSafePath(Routes.CLIENT_DASHBOARD, {
      //         clientId: id,
      //       })}
      //       openInNew
      //     >
      //       {id}
      //     </RouterLink>
      //   ),
      // },
      CLIENT_COLUMNS.first,
      CLIENT_COLUMNS.last,
      { ...CLIENT_COLUMNS.ssn, width: '150px' },
      { ...CLIENT_COLUMNS.dobAge, width: '180px' },
      ,
      HudRecordMetadataHistoryColumn,
      {
        key: 'mergeAction',
        render: () => <Button fullWidth>Merge</Button>,
      },
    ];
  }, []);

  return (
    <>
      <PageTitle title='Client Merge' />
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
    </>
  );
};

export default ClientMerge;
