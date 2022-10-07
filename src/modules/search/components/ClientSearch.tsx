import { Paper, Stack } from '@mui/material';
import { isEmpty, isNil, omitBy } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { searchParamsToState, searchParamsToVariables } from '../searchUtil';

import ClientCard from '@/components/elements/ClientCard';
import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import LinkToClient from '@/components/elements/LinkToClient';
import Loading from '@/components/elements/Loading';
import Pagination, {
  PaginationSummary,
} from '@/components/elements/Pagination';
import formData from '@/modules/form/data/search.json';
import { FormDefinition } from '@/modules/form/types';
import {
  age,
  clientFirstNameAndPreferred,
  clientName,
  dob,
  last4SSN,
} from '@/modules/hmis/hmisUtil';
import SearchForm, {
  SearchFormProps,
} from '@/modules/search/components/SearchForm';
import SearchResultsHeader from '@/modules/search/components/SearchResultsHeader';
import {
  ClientFieldsFragment,
  useSearchClientsLazyQuery,
} from '@/types/gqlTypes';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const MAX_CARDS_THRESHOLD = 10;

export const CLIENT_COLUMNS: {
  [key: string]: ColumnDef<ClientFieldsFragment>;
} = {
  id: { header: 'ID', render: 'id', width: '10%' },
  ssn: {
    header: 'SSN',
    width: '8%',
    render: (client: ClientFieldsFragment) => last4SSN(client),
  },
  name: {
    header: 'Name',
    key: 'name',
    render: (client: ClientFieldsFragment) => clientName(client),
  },
  linkedName: {
    header: 'Name',
    key: 'name',
    render: (client: ClientFieldsFragment) => (
      <LinkToClient client={client} target='_blank' />
    ),
  },
  first: {
    header: 'First Name',
    render: (client: ClientFieldsFragment) =>
      clientFirstNameAndPreferred(client),
  },
  last: {
    header: 'Last Name',
    render: 'lastName',
  },
  dobAge: {
    header: 'DOB / Age',
    render: (row: ClientFieldsFragment) =>
      row.dob && (
        <Stack direction='row' spacing={1}>
          <span>{dob(row)}</span>
          <span>{`(${age(row)})`}</span>
        </Stack>
      ),
  },
};

export const searchResultColumns: ColumnDef<ClientFieldsFragment>[] = [
  CLIENT_COLUMNS.id,
  CLIENT_COLUMNS.ssn,
  { ...CLIENT_COLUMNS.first, width: '15%', linkTreatment: true },
  { ...CLIENT_COLUMNS.last, width: '25%', linkTreatment: true },
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
  const [offset, setOffset] = useState(0);

  const [searchClients, { data, loading, error }] = useSearchClientsLazyQuery({
    variables: {
      input: {},
      limit: pageSize,
      offset,
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
      setOffset(0);
    };
  }, [searchClients, setSearchParams, setDerivedSearchParams]);

  const handleChangeDisplayType = useMemo(() => {
    return (_: any, checked: boolean) => {
      setCards(checked);
      setHasSetCards(true);
    };
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
        definition={searchFormDefinition}
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
                  showLinkToRecord
                  // TODO re-enable when we have data for it
                  // showNotices
                  // linkTargetBlank
                />
              ))
            ) : (
              <WrapperComponent>
                <GenericTable
                  columns={searchResultColumns}
                  rowLinkTo={rowLinkTo}
                  rows={data.clientSearch.nodes || []}
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
