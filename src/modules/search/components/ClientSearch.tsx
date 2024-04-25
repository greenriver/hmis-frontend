import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Box, Paper, Stack, TableCell, TableRow } from '@mui/material';

import { isEmpty, isNil, omitBy } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { searchParamsToState, searchParamsToVariables } from '../searchUtil';
import ClientSearchAdvancedForm from './ClientAdvancedSearchForm';
import ClientDisplayTypeToggle, {
  DisplayType,
} from './ClientDisplayTypeToggle';
import ClientSearchTypeToggle, { SearchType } from './ClientSearchTypeToggle';

import ClientTextSearchForm from './ClientTextSearchForm';
import ButtonLink from '@/components/elements/ButtonLink';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import { ColumnDef } from '@/components/elements/table/types';
import { useIsMobile } from '@/hooks/useIsMobile';

import ClientName from '@/modules/client/components/ClientName';
import ClientSearchResultCard from '@/modules/client/components/ClientSearchResultCard';
import {
  ContextualClientDobAge,
  ContextualClientSsn,
  ContextualDobToggleButton,
  ContextualSsnToggleButton,
  SsnDobShowContextProvider,
} from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { SearchFormDefinition } from '@/modules/form/data';
import {
  getInputTypeForRecordType,
  useFilters,
} from '@/modules/hmis/filterUtil';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

import { isEnrollment, isHouseholdClient } from '@/modules/household/types';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes, Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientSearchInput as ClientSearchInputType,
  ClientSortOption,
  ExternalIdentifierType,
  HouseholdClientFieldsFragment,
  ProjectEnrollmentFieldsFragment,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

function asClient(
  record:
    | ClientFieldsFragment
    | HouseholdClientFieldsFragment
    | ProjectEnrollmentFieldsFragment
) {
  if (isHouseholdClient(record)) return record.client;
  if (isEnrollment(record)) return record.client;
  return record;
}
export const CLIENT_COLUMNS: {
  [key: string]: ColumnDef<
    | ClientFieldsFragment
    | HouseholdClientFieldsFragment
    | ProjectEnrollmentFieldsFragment
  >;
} = {
  id: { header: 'HMIS ID', render: 'id' },
  name: {
    header: 'Name',
    key: 'name',
    render: (client) => <ClientName client={asClient(client)} />,
  },
  linkedName: {
    header: 'Name',
    key: 'name',
    render: (client) => <ClientName client={asClient(client)} linkToProfile />,
  },
  linkedNameNewTab: {
    header: 'Name',
    key: 'name',
    render: (client) => (
      <ClientName
        client={asClient(client)}
        linkToProfile
        routerLinkProps={{ openInNew: true }}
      />
    ),
  },
  first: {
    header: 'First Name',
    render: (client) => asClient(client).firstName,
  },
  last: {
    header: 'Last Name',
    render: (client) => asClient(client).lastName,
  },
  ssn: {
    header: (
      <ContextualSsnToggleButton sx={{ p: 0 }} variant='text' size='small' />
    ),
    key: 'ssn',
    render: (client) => <ContextualClientSsn client={asClient(client)} />,
    dontLink: true,
  },
  dobAge: {
    header: (
      <Stack direction='row' justifyContent='space-between'>
        <ContextualDobToggleButton sx={{ p: 0 }} variant='text' size='small' />
      </Stack>
    ),
    key: 'dob',
    render: (client) => <ContextualClientDobAge client={asClient(client)} />,
    dontLink: true,
  },
};

export const SEARCH_RESULT_COLUMNS: ColumnDef<ClientFieldsFragment>[] = [
  CLIENT_COLUMNS.id,
  {
    ...CLIENT_COLUMNS.first,
    linkTreatment: true,
    ariaLabel: (row) => clientNameAllParts(row),
  },
  { ...CLIENT_COLUMNS.last, linkTreatment: true },
  { ...CLIENT_COLUMNS.ssn, width: '150px' },
  { ...CLIENT_COLUMNS.dobAge, width: '180px' },
];

export const MOBILE_SEARCH_RESULT_COLUMNS: ColumnDef<ClientFieldsFragment>[] = [
  CLIENT_COLUMNS.id,
  {
    ...CLIENT_COLUMNS.name,
    linkTreatment: true,
    ariaLabel: (row) => clientNameAllParts(row),
  },
  { ...CLIENT_COLUMNS.ssn },
  { ...CLIENT_COLUMNS.dobAge },
];

/**
 * Client Search page
 */
const ClientSearch = () => {
  // type of search (broad or specific)
  const [searchType, setSearchType] = useState<SearchType>('broad');
  // type of display (table or cards)
  const [displayType, setDisplayType] = useState<DisplayType>('table');
  // URL search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  // whether the search params were derived
  const [derivedSearchParams, setDerivedSearchParams] =
    useState<boolean>(false);
  // initial form state derived from the SearchParams
  const [initialValues, setInitialValues] = useState<ClientSearchInputType>();
  // whether search has occurred
  const [hasSearched, setHasSearched] = useState(false);

  const isMobile = useIsMobile();

  const [searchInput, setSearchInput] = useState<ClientSearchInputType | null>(
    null
  );

  const [canViewSsn] = useHasRootPermissions([
    'canViewFullSsn',
    'canViewPartialSsn',
  ]);

  const [canViewDob] = useHasRootPermissions(['canViewDob']);

  const { globalFeatureFlags } = useHmisAppSettings();

  const columns = useMemo(() => {
    if (displayType === 'cards') {
      return [];
    }
    let baseColumns = isMobile
      ? MOBILE_SEARCH_RESULT_COLUMNS
      : SEARCH_RESULT_COLUMNS;
    if (globalFeatureFlags?.mciId) {
      baseColumns = [
        externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
        ...baseColumns,
      ];
    }
    if (!canViewSsn) baseColumns = baseColumns.filter((c) => c.key !== 'ssn');
    if (!canViewDob)
      baseColumns = baseColumns.map((c) =>
        c.key === 'dob' ? { ...c, header: 'Age' } : c
      );
    return baseColumns;
  }, [isMobile, globalFeatureFlags, displayType, canViewSsn, canViewDob]);

  useEffect(() => {
    // if search params are derived, we don't want to perform a search on them
    if (derivedSearchParams) return;

    // this is the first render, so derive the initial state from the SearchParams and perform a search
    const variables = searchParamsToVariables(
      SearchFormDefinition,
      searchParams
    );
    if (isEmpty(variables)) {
      setInitialValues({});
    } else {
      const initState = searchParamsToState(searchParams);
      setInitialValues(initState);
      setSearchInput(initState);
      if (!initState.textSearch) setSearchType('specific');
    }
  }, [derivedSearchParams, searchParams]);

  const rowLinkTo = useCallback(
    (row: ClientFieldsFragment) =>
      generateSafePath(ClientDashboardRoutes.PROFILE, {
        clientId: row.id,
      }),
    []
  );

  const onClearSearch = useCallback(() => {
    setSearchInput(null);
    setSearchParams({});
    setHasSearched(false);
  }, [setSearchParams]);

  // When form is submitted, update the search parameters and perform the search
  const handleSubmitSearch = useMemo(() => {
    return (values: Record<string, any>) => {
      const cleaned = omitBy(values, isNil);
      if (isEmpty(cleaned)) return;

      // Construct derived search parameters and update the URL
      const searchParams = createSearchParams(cleaned);
      setSearchParams(searchParams);
      setDerivedSearchParams(true); // so that searchParam change doesn't trigger a query

      // Perform the search
      setSearchInput(cleaned);
    };
  }, [setSearchParams, setDerivedSearchParams]);

  const filters = useFilters({
    type: getInputTypeForRecordType('Client'),
    omit: ['searchTerm'],
  });

  return (
    <SsnDobShowContextProvider>
      <Stack
        mb={2}
        direction='row'
        justifyContent='space-between'
        alignItems={'flex-end'}
      >
        <ClientSearchTypeToggle value={searchType} onChange={setSearchType} />
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
            initialValue={initialValues?.textSearch || ''}
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
            initialValues={initialValues}
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
            ClientFieldsFragment
          >
            queryVariables={{ input: searchInput }}
            queryDocument={SearchClientsDocument}
            onCompleted={() => setHasSearched(true)}
            rowLinkTo={rowLinkTo}
            columns={columns}
            pagePath='clientSearch'
            fetchPolicy='cache-and-network'
            showFilters
            filters={filters}
            recordType='Client'
            defaultSortOption={
              searchType === 'broad'
                ? ClientSortOption.BestMatch
                : ClientSortOption.LastNameAToZ
            }
            tableDisplayOptionButtons={
              <ClientDisplayTypeToggle
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
              displayType === 'cards' && (canViewDob || canViewSsn)
                ? [
                    <Stack direction='row-reverse' gap={2}>
                      {canViewDob && (
                        <ContextualDobToggleButton
                          sx={{ p: 0 }}
                          variant='text'
                          size='small'
                        />
                      )}
                      {canViewSsn && (
                        <ContextualSsnToggleButton
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
