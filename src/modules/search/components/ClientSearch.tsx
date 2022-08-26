import { Paper } from '@mui/material';
import { omitBy, isNil, isEmpty } from 'lodash-es';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, createSearchParams } from 'react-router-dom';

import { searchParamsToVariables, searchParamsToState } from '../searchUtil';

import Loading from '@/components/elements/Loading';
import Pagination, {
  PaginationSummary,
} from '@/components/elements/Pagination';
import formData from '@/modules/form/data/search.json';
import { FormDefinition } from '@/modules/form/types';
import SearchForm from '@/modules/search/components/SearchForm';
import SearchResults, {
  SearchResultsHeader,
} from '@/modules/search/components/SearchResults';
import { useSearchClientsLazyQuery } from '@/types/gqlTypes';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const PAGE_SIZE = 20;
const MAX_CARDS_THRESHOLD = 10;

const ClientSearch: React.FC = () => {
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
  const [offset, setOffset] = useState(0);

  const [searchClients, { data, loading, error }] = useSearchClientsLazyQuery({
    variables: {
      input: {},
      limit: PAGE_SIZE,
      offset,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      // update display type (card vs table) based on length of results
      // if the use has manually set the display type alread, don't change it
      if (!hasSetCards) {
        setCards(data.clientSearch.nodesCount <= MAX_CARDS_THRESHOLD);
      }
    },
  });

  useEffect(() => {
    // if search params are derived, we don't want to perform a search on them
    if (derivedSearchParams) return;

    // this is the first render, so derive the initial state from the SearchParams and perform a search
    const variables = searchParamsToVariables(
      searchFormDefinition,
      searchParams
    );
    if (isEmpty(variables)) {
      setInitialValues({});
    } else {
      const initState = searchParamsToState(searchFormDefinition, searchParams);
      setInitialValues(initState);
      // Perform search using the cache so when you nav back/forward it doesn't refetch
      searchClients({
        variables: { input: variables },
        fetchPolicy: 'cache-first',
      });
    }
  }, [derivedSearchParams, searchParams, searchClients]);

  // When form is submitted, update the search parameters and perform the search
  const handleSubmitSearch = useMemo(() => {
    return (values: Record<string, any>) => {
      const cleaned = omitBy(values, isNil);

      // Construct derived search parameters and update the URL
      const searchParams = createSearchParams(cleaned);
      setSearchParams(searchParams);
      setDerivedSearchParams(true); // so that searchParam change doesn't trigger a query

      // Perform the search
      searchClients({ variables: { input: cleaned } });
    };
  }, [searchClients, setSearchParams, setDerivedSearchParams]);

  const handleChangeDisplayType = useMemo(() => {
    return (_: any, checked: boolean) => {
      setCards(checked);
      setHasSetCards(true);
    };
  }, []);

  if (!initialValues) return <Loading />;

  const paginationProps = {
    limit: PAGE_SIZE,
    offset,
    totalEntries: data?.clientSearch.nodesCount || -1,
    itemName: 'clients',
  };
  const hasResults = !!data?.clientSearch?.nodes.length;
  return (
    <>
      <SearchForm
        definition={searchFormDefinition}
        onSubmit={handleSubmitSearch}
        initialValues={initialValues}
      />
      {error && <Paper sx={{ p: 2 }}>{error.message}</Paper>}
      {(data || loading) && (
        <SearchResultsHeader
          disabled={!hasResults}
          cardsEnabled={!!cards}
          onChangeCards={handleChangeDisplayType}
        />
      )}
      {loading && <Loading />}
      {data && !loading && (
        <>
          <PaginationSummary {...paginationProps} sx={{ mb: 2 }} />
          <SearchResults data={data} useCards={cards} />
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
