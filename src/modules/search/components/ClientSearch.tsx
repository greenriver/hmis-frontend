import { Paper } from '@mui/material';
import { isEmpty, isNil, omitBy } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { searchParamsToState, searchParamsToVariables } from '../searchUtil';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import Pagination, {
  PaginationSummary,
} from '@/components/elements/Pagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import ClientCard from '@/modules/client/components/ClientCard';
import ClientName from '@/modules/client/components/ClientName';
import { SearchFormDefinition } from '@/modules/form/data';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import SearchForm, {
  SearchFormProps,
} from '@/modules/search/components/SearchForm';
import SearchResultsHeader from '@/modules/search/components/SearchResultsHeader';
import {
  ClientFieldsFragment,
  ClientSortOption,
  useSearchClientsLazyQuery,
} from '@/types/gqlTypes';

const MAX_CARDS_THRESHOLD = 10;

export const CLIENT_COLUMNS: {
  [key: string]: ColumnDef<ClientFieldsFragment>;
} = {
  id: { header: 'HMIS ID', render: 'id', width: '10%' },
  name: {
    header: 'Name',
    key: 'name',
    render: (client: ClientFieldsFragment) => <ClientName client={client} />,
  },
  linkedName: {
    header: 'Name',
    key: 'name',
    render: (client: ClientFieldsFragment) => (
      <ClientName
        client={client}
        routerLinkProps={{ target: '_blank' }}
        linkToProfile
      />
    ),
  },
  first: {
    header: 'First Name',
    render: 'firstName',
  },
  last: {
    header: 'Last Name',
    render: 'lastName',
  },
  ssn: {
    header: 'SSN',
    key: 'ssn',
    width: '8%',
    render: (client: ClientFieldsFragment) => (
      <ClientSsn client={client} lastFour />
    ),
    // dontLink: true,
  },
  dobAge: {
    header: 'DOB / Age',
    key: 'dob',
    render: (client: ClientFieldsFragment) => (
      <ClientDobAge client={client} reveal />
    ),
    // dontLink: true,
  },
};

export const SEARCH_RESULT_COLUMNS: ColumnDef<ClientFieldsFragment>[] = [
  CLIENT_COLUMNS.id,
  {
    ...CLIENT_COLUMNS.first,
    width: '15%',
    linkTreatment: true,
    ariaLabel: (row) => clientNameAllParts(row),
  },
  { ...CLIENT_COLUMNS.last, width: '15%', linkTreatment: true },
  { ...CLIENT_COLUMNS.preferred, width: '15%', linkTreatment: true },
  { ...CLIENT_COLUMNS.ssn, width: '10%' },
  { ...CLIENT_COLUMNS.dobAge, width: '10%' },
];

export const MOBILE_SEARCH_RESULT_COLUMNS: ColumnDef<ClientFieldsFragment>[] = [
  CLIENT_COLUMNS.id,
  {
    ...CLIENT_COLUMNS.name,
    width: '15%',
    linkTreatment: true,
    ariaLabel: (row) => clientNameAllParts(row),
  },
  { ...CLIENT_COLUMNS.ssn, width: '10%' },
  { ...CLIENT_COLUMNS.dobAge, width: '10%' },
];

interface Props
  extends Omit<SearchFormProps, 'definition' | 'onSubmit' | 'initialValues'> {
  cardsEnabled: boolean;
  searchResultsTableProps?: Omit<
    GenericTableProps<ClientFieldsFragment>,
    'rows'
  >;
  wrapperComponent?: React.ElementType;
  pageSize?: number;
}
const ClientSearch: React.FC<Props> = ({
  cardsEnabled,
  searchResultsTableProps,
  wrapperComponent: WrapperComponent = Paper,
  pageSize = 20,
  ...searchFormProps
}) => {
  // URL search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  // whether the search params were derived
  const [derivedSearchParams, setDerivedSearchParams] =
    useState<boolean>(false);
  // initial form state derived from the SearchParams
  const [initialValues, setInitialValues] = useState<Record<string, any>>();
  // whether to display results as cards or a table
  const [cards, setCards] = useState<boolean>(false);
  // whether user has manually selected display format
  const [hasSetCards, setHasSetCards] = useState<boolean>(false);
  // Sort option
  const [sortOrder, setSortOrder] = useState<ClientSortOption>(
    ClientSortOption.LastNameAToZ
  );
  const [offset, setOffset] = useState(0);

  const isMobile = useIsMobile();

  const { globalFeatureFlags } = useHmisAppSettings();

  const columns = useMemo(() => {
    let baseColumns = isMobile
      ? MOBILE_SEARCH_RESULT_COLUMNS
      : SEARCH_RESULT_COLUMNS;
    if (globalFeatureFlags?.mciId) {
      baseColumns = [externalIdColumn('MCI ID'), ...baseColumns];
    }
    return baseColumns;
  }, [isMobile, globalFeatureFlags]);
  const handleSetSortOrder: typeof setSortOrder = useCallback((value) => {
    setOffset(0);
    return setSortOrder(value);
  }, []);

  const [searchClients, { data, loading, error }] = useSearchClientsLazyQuery({
    variables: {
      input: {},
      limit: pageSize,
      offset,
      sortOrder,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      // update display type (card vs table) based on length of results
      // if the use has manually set the display type alread, don't change it
      if (!hasSetCards && cardsEnabled) {
        setCards(data.clientSearch.nodesCount <= MAX_CARDS_THRESHOLD);
      }
    },
  });

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
      const initState = searchParamsToState(SearchFormDefinition, searchParams);
      setInitialValues(initState);
      // Perform search using the cache so when you nav back/forward it doesn't refetch
      searchClients({
        variables: { input: variables, sortOrder },
        fetchPolicy: 'cache-first',
      });
    }
  }, [derivedSearchParams, searchParams, searchClients, sortOrder]);

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
      searchClients({ variables: { input: cleaned } });
      setOffset(0);
    };
  }, [searchClients, setSearchParams, setDerivedSearchParams]);

  const handleChangeDisplayType = useCallback((_: any, checked: boolean) => {
    if (isNil(checked)) return;
    setCards(checked);
    setHasSetCards(true);
  }, []);

  const rowLinkTo = useCallback(
    (row: ClientFieldsFragment) => `/client/${row.id}`,
    []
  );

  if (!initialValues) return <Loading />;

  const paginationProps = {
    limit: pageSize,
    offset,
    totalEntries: data?.clientSearch.nodesCount || -1,
    itemName: 'clients',
  };
  const hasResults = !!data?.clientSearch?.nodes.length;
  return (
    <>
      <SearchForm
        definition={SearchFormDefinition}
        onSubmit={handleSubmitSearch}
        initialValues={initialValues}
        {...searchFormProps}
      />
      {error && <Paper sx={{ p: 2 }}>{error.message}</Paper>}
      {(data || loading) && (
        <SearchResultsHeader
          showCardToggle={cardsEnabled}
          disabled={!hasResults}
          cardsEnabled={!!cards}
          onChangeCards={handleChangeDisplayType}
          sortOrder={sortOrder}
          onChangeSortOrder={handleSetSortOrder}
        />
      )}
      {loading && <Loading />}
      {data && !loading && (
        <>
          <PaginationSummary {...paginationProps} sx={{ mb: 2 }} />
          {!hasResults && (
            <WrapperComponent sx={{ mb: 2, p: 2 }}>
              No clients found.
            </WrapperComponent>
          )}
          {hasResults &&
            (cards ? (
              data.clientSearch.nodes.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  // TODO re-enable when we have data for it
                  // showNotices
                  // linkTargetBlank
                />
              ))
            ) : (
              <WrapperComponent>
                <GenericTable
                  columns={columns}
                  rowLinkTo={rowLinkTo}
                  rows={data.clientSearch.nodes || []}
                  headerCellSx={() => ({
                    fontWeight: 800,
                  })}
                  {...searchResultsTableProps}
                />
              </WrapperComponent>
            ))}
          <Pagination
            {...paginationProps}
            setOffset={setOffset}
            gridProps={{ mt: 2 }}
          />
        </>
      )}
    </>
  );
};

export default ClientSearch;
