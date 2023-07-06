import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { Button, Paper } from '@mui/material';
import { isEmpty, isNil, omitBy } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { searchParamsToState, searchParamsToVariables } from '../searchUtil';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/table/GenericTable';
import Pagination, {
  PaginationSummary,
} from '@/components/elements/table/Pagination';
import { ColumnDef } from '@/components/elements/table/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import ClientCard from '@/modules/client/components/ClientCard';
import ClientName from '@/modules/client/components/ClientName';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { SearchFormDefinition } from '@/modules/form/data';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import SearchForm, {
  SearchFormProps,
} from '@/modules/search/components/SearchForm';
import SearchResultsHeader from '@/modules/search/components/SearchResultsHeader';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientSortOption,
  FormRole,
  useSearchClientsLazyQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

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
  addClientInDialog?: boolean;
}
const ClientSearch: React.FC<Props> = ({
  cardsEnabled,
  searchResultsTableProps,
  wrapperComponent: WrapperComponent = Paper,
  pageSize = 20,
  addClientInDialog = false,
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
    (row: ClientFieldsFragment) =>
      generateSafePath(ClientDashboardRoutes.PROFILE, {
        clientId: row.id,
      }),
    []
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<ClientFieldsFragment>({
      formRole: FormRole.Client,
      onCompleted: (data: ClientFieldsFragment) => {
        searchClients({
          variables: { input: { id: data.id } },
          fetchPolicy: 'cache-first',
        });
      },
      // For Client creation, allow the user to input SSN and DOB
      // even if they don't have read-access to those fields
      localConstants: { canViewFullSsn: true, canViewDob: true },
    });
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
      {error && (
        <ApolloErrorAlert AlertProps={{ sx: { p: 2 } }} error={error} />
      )}
      {(data || loading) && (
        <SearchResultsHeader
          showCardToggle={cardsEnabled}
          disabled={!hasResults}
          cardsEnabled={!!cards}
          onChangeCards={handleChangeDisplayType}
          sortOrder={sortOrder}
          onChangeSortOrder={handleSetSortOrder}
          addClientButton={
            addClientInDialog ? (
              <Button
                onClick={openFormDialog}
                data-testid='addClientButton'
                sx={{ px: 3 }}
                startIcon={<LibraryAddIcon />}
                variant='outlined'
                color='secondary'
              >
                Add Client
              </Button>
            ) : undefined
          }
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
                <ClientCard key={client.id} client={client} />
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
      {renderFormDialog({
        title: 'Add client',
        submitButtonText: 'Create Client',
      })}
    </>
  );
};

export default ClientSearch;
