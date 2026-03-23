import { useApolloClient } from '@apollo/client';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Box, Paper, Stack, TableCell, TableRow } from '@mui/material';

import { isEmpty, isNil, omitBy } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useResolvedSearchQueryId from '../hooks/useResolvedSearchQueryId';
import ClientSearchAdvancedForm from './ClientAdvancedSearchForm';
import ClientSearchTypeToggle, { SearchType } from './ClientSearchTypeToggle';

import ClientTextSearchForm from './ClientTextSearchForm';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonTableDisplayToggle, {
  DisplayType,
} from '@/components/elements/CommonTableDisplayToggle';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import { useIsMobile } from '@/hooks/useIsMobile';

import useSearchParamsState from '@/hooks/useSearchParamState';
import ClientName from '@/modules/client/components/ClientName';
import ClientSearchResultCard from '@/modules/client/components/searchResultCard/ClientSearchResultCard';
import {
  ContextualClientDobAge,
  ContextualDobToggleButton,
  SsnDobShowContextProvider,
} from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { clientBriefName } from '@/modules/hmis/hmisUtil';

import { isEnrollment, isHouseholdClient } from '@/modules/household/types';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { Routes } from '@/routes/routes';
import {
  ClientSearchInput as ClientSearchInputType,
  ClientSearchResultFieldsFragment,
  ClientSortOption,
  ExternalIdentifierType,
  GetSearchQueryDocument,
  HouseholdClientFieldsFragment,
  ProjectEnrollmentFieldsFragment,
  ProjectEnrollmentsHouseholdClientFieldsFragment,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';

export function asClient(
  record:
    | ClientSearchResultFieldsFragment
    | HouseholdClientFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentsHouseholdClientFieldsFragment
) {
  if (isHouseholdClient(record)) return record.client;
  if (isEnrollment(record)) return record.client;
  return record;
}

export const CLIENT_COLUMNS: {
  [key: string]: ColumnDef<
    | ClientSearchResultFieldsFragment
    | HouseholdClientFieldsFragment
    | ProjectEnrollmentFieldsFragment
    | ProjectEnrollmentsHouseholdClientFieldsFragment
  >;
} = {
  id: { header: 'HMIS ID', render: 'id', key: 'id' },
  name: {
    header: 'Client Name',
    key: 'name',
    render: (client) => <ClientName client={asClient(client)} />,
  },
  age: {
    header: 'Age',
    key: 'age',
    render: (client) => asClient(client).age,
  },
  first: {
    header: 'First Name',
    key: 'firstName',
    render: (client) => asClient(client).firstName,
  },
  last: {
    header: 'Last Name',
    key: 'lastName',
    render: (client) => asClient(client).lastName,
  },
  dobAge: {
    header: (
      <Stack direction='row' justifyContent='space-between'>
        <ContextualDobToggleButton sx={{ p: 0 }} variant='text' size='small' />
      </Stack>
    ),
    key: 'dob',
    render: (client) => <ContextualClientDobAge client={asClient(client)} />,
    // Don't link cell even if row is linked, because of internal click target
    dontLink: true,
    // Fixed width so it doesn't move around when visibility is toggled
    width: '180px',
  },
};

// Desktop and Mobile have same columns currently, but keeping separated for future flexibility.
export const SEARCH_RESULT_COLUMNS: ColumnDef<ClientSearchResultFieldsFragment>[] =
  [CLIENT_COLUMNS.name, CLIENT_COLUMNS.id, CLIENT_COLUMNS.dobAge];

export const MOBILE_SEARCH_RESULT_COLUMNS: ColumnDef<ClientSearchResultFieldsFragment>[] =
  [CLIENT_COLUMNS.name, CLIENT_COLUMNS.id, CLIENT_COLUMNS.dobAge];

interface ClientSearchProps {
  searchType: SearchType;
}

/**
 * Main client search UI
 *
 * This component renders:
 * - "Search Type" toggle for switching between 'broad' and 'specific' search modes
 * - Input form for text search or advanced search, depending on the search type
 * - Paginated search results table, which can be displayed as cards or table (state tracked internally)
 *
 * Special logic:
 * - Tracks whether or not a search has occurred, and displays an "Add New Client" button if it has.
 *   This is a guard to prevent users from client duplicate clients without searching first.
 * - Depending on global feature flags, the table may include an "MCI ID" column.
 * - Search parameters are synced with the URL (TODO: update when changed to searchQueryId approach)
 */
const ClientSearch: React.FC<ClientSearchProps> = ({ searchType }) => {
  const apolloClient = useApolloClient();
  const isMobile = useIsMobile();
  const isTiny = useIsMobile('sm');

  // type of display (table or cards)
  const [displayType, setDisplayType] = useState<DisplayType>('table');

  // Whether the user has searched for clients (and the results are visible).
  // Visibility of "Add New Client" button is gated on this, to prevent user from adding
  // duplicate clients before completing a search.
  const [hasSearched, setHasSearched] = useState(false);

  // the current search input, including text search and advanced search fields
  const [searchInput, setSearchInput] = useState<ClientSearchInputType | null>(
    null
  );

  // The current search query ID. Stored in the URL params to support back-button navigation without PII in the URL.
  const [{ searchQueryId }, setSearchParams] = useSearchParamsState({
    paramsDefinition: {
      // the ID of the ClientSearchQuery from the backend
      searchQueryId: { type: 'string', default: null },
    },
  });

  // Resolve the search query ID into usable search params
  const { loading: searchQueryLoading } = useResolvedSearchQueryId({
    searchQueryId,
    onCompleted: (clientSearchInput) => {
      if (clientSearchInput) setSearchInput(clientSearchInput);
    },
  });

  // useEffect(() => {
  //   if (resolvedSearchInput) setSearchInput(resolvedSearchInput);
  // }, [resolvedSearchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput(null);
    setHasSearched(false);
  }, []);

  // Clear search when the search query ID is cleared (such as using the back-button)
  // todo @martha - this still has some funny behavior but not all the time, need to consistently repro.
  // example: search, search again, click client, back button, back button again
  // I keep seeing the search params flicker at unexpected times, maybe it's related to a network request
  useEffect(() => {
    if (searchQueryId === null) {
      clearSearch();
    }
  }, [searchQueryId, clearSearch]);

  // Callback for use when the 'clear' button is clicked on either search form
  const onClearSearch = useCallback(() => {
    clearSearch();
    setSearchParams({ searchQueryId: null });
  }, [clearSearch, setSearchParams]);

  const [canViewDob] = useHasRootPermissions(['canViewDob']);

  const { globalFeatureFlags } = useGlobalFeatureFlags();

  const columns = useMemo(() => {
    if (displayType === 'cards') {
      return [];
    }
    let baseColumns = isMobile
      ? MOBILE_SEARCH_RESULT_COLUMNS
      : SEARCH_RESULT_COLUMNS;
    if (globalFeatureFlags?.mciIdEnabled) {
      baseColumns = [
        externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
        ...baseColumns,
      ];
    }
    if (!canViewDob)
      baseColumns = baseColumns.map((c) =>
        c.key === 'dob' ? { ...c, header: 'Age' } : c
      );
    return baseColumns;
  }, [isMobile, globalFeatureFlags, displayType, canViewDob]);

  // When form is submitted, update the search parameters and perform the search
  const handleSubmitSearch = useMemo(() => {
    return (values: Record<string, any>) => {
      const cleaned = omitBy(values, isNil);
      if (isEmpty(cleaned)) return;

      // Perform the search
      setSearchInput(cleaned);
    };
  }, []);

  // When search data is returned, update the URL params and the apollo cache
  const handleSearchCompleted = useCallback(
    (data: SearchClientsQuery) => {
      // only update the search params if this is the completion of a network call, not a cache hit.
      // this avoids buggy behavior with the back-button
      const returnedSearchQueryId = data?.clientSearch.searchQueryId;
      if (returnedSearchQueryId && searchQueryId !== returnedSearchQueryId) {
        // Write the search query we received to the cache with the current search params,
        // so it's ready next time we query SearchQuery even though it wouldn't normally be in the cache
        // because we got it from a SearchClients query, not a SearchQuery query.
        apolloClient.writeQuery({
          query: GetSearchQueryDocument,
          variables: { id: returnedSearchQueryId },
          data: {
            searchQuery: {
              __typename: 'SearchQuery',
              id: returnedSearchQueryId,
              // Populate fields that aren't included in this search as null.
              // Otherwise, apollo makes a network request because it thinks it's missing the full object
              textSearch: searchInput?.textSearch || null,
              personalId: searchInput?.personalId || null,
              warehouseId: searchInput?.warehouseId || null,
              firstName: searchInput?.firstName || null,
              lastName: searchInput?.lastName || null,
              ssnSerial: searchInput?.ssnSerial || null,
              dob: searchInput?.dob || null,
            },
          },
        });

        // update the url bar with the searchQueryId we just received.
        setSearchParams({ searchQueryId: returnedSearchQueryId });
      }
    },
    [searchQueryId, setSearchParams, searchInput, apolloClient]
  );

  const filters = useFilters({
    type: 'ClientFilterOptions',
    omit: ['searchTerm'],
  });

  if (searchQueryLoading) return <Loading />;

  return (
    <SsnDobShowContextProvider>
      <Stack
        mb={2}
        gap={2}
        direction={isTiny ? 'column' : 'row'}
        justifyContent='space-between'
        alignItems={isTiny ? undefined : 'flex-end'}
      >
        <ClientSearchTypeToggle value={searchType} />
        {hasSearched && (
          <RootPermissionsFilter permissions='canEditClients'>
            <Box sx={{ height: 'fit-content' }}>
              <ButtonLink
                data-testid='addClientButton'
                to={Routes.CREATE_CLIENT}
                sx={{ px: 4, py: 2 }}
                Icon={PersonAddIcon}
                size='medium'
              >
                Add New Client
              </ButtonLink>
            </Box>
          </RootPermissionsFilter>
        )}
      </Stack>
      <Box mb={5}>
        {searchType === 'broad' ? (
          <ClientTextSearchForm
            initialValue={searchInput?.textSearch || ''}
            onSearch={(text) => handleSubmitSearch({ textSearch: text })}
            label={null}
            size='medium'
            hideSearchButton
            showSearchTips
            minChars={3}
            onClearSearch={onClearSearch}
            searchAdornment
            clearAdornment
            hideClearButton
          />
        ) : (
          <ClientSearchAdvancedForm
            initialValues={searchInput || undefined}
            onSearch={(input) => handleSubmitSearch(input)}
            onClearSearch={onClearSearch}
          />
        )}
      </Box>
      {searchInput && (
        <Paper>
          <GenericTableWithData<
            SearchClientsQuery,
            SearchClientsQueryVariables,
            ClientSearchResultFieldsFragment
          >
            queryVariables={{ input: searchInput }}
            queryDocument={SearchClientsDocument}
            onDataReady={() => setHasSearched(true)}
            onCompleted={handleSearchCompleted}
            columns={columns}
            rowLinkTo={(client) => getViewClientMenuItem(client).to}
            rowName={(row) => clientBriefName(row)}
            rowActionTitle='View Client'
            pagePath='clientSearch'
            fetchPolicy='cache-and-network'
            filters={filters}
            recordType='Client'
            defaultSortOption={
              searchType === 'broad'
                ? ClientSortOption.BestMatch
                : ClientSortOption.LastNameAToZ
            }
            tableDisplayOptionButtons={
              <CommonTableDisplayToggle
                value={displayType}
                onChange={setDisplayType}
              />
            }
            renderRow={
              displayType === 'cards'
                ? (client) => (
                    <TableRow key={client.id}>
                      <TableCell colSpan={columns.length} sx={{ py: 2 }}>
                        <ClientSearchResultCard
                          key={client.id}
                          client={client}
                        />
                      </TableCell>
                    </TableRow>
                  )
                : undefined
            }
            toolbars={
              displayType === 'cards' && canViewDob
                ? [
                    <Stack direction='row-reverse' gap={2}>
                      {canViewDob && (
                        <ContextualDobToggleButton
                          sx={{ p: 0 }}
                          variant='text'
                          size='small'
                        />
                      )}
                    </Stack>,
                  ]
                : undefined
            }
          />
        </Paper>
      )}
    </SsnDobShowContextProvider>
  );
};

export default ClientSearch;
