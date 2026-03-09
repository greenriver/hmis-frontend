import {
  OperationVariables,
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { Box, Stack } from '@mui/material';
import { get, isEmpty, isEqual, lowerFirst, startCase } from 'lodash-es';
import pluralize from 'pluralize';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { FilterType, DataColumnDef } from '../types';

import Loading from '@/components/elements/Loading';
import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/table/GenericTable';
import Pagination from '@/components/elements/table/Pagination';
import TableControls, {
  TableFiltersProps,
} from '@/components/elements/tableFilters/TableControls';
import useHasRefetched from '@/hooks/useHasRefetched';
import usePrevious from '@/hooks/usePrevious';
import useSearchParamsState from '@/hooks/useSearchParamState';
import { useOptionalColumns } from '@/modules/dataFetching/hooks/useOptionalColumns';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import {
  getDefaultSortOptionForType,
  getSortOptionForType,
  transformDynamicFilters,
} from '@/modules/hmis/filterUtil';
import { getSchemaForType } from '@/modules/hmis/hmisUtil';
import { useGetSearchQueryQuery } from '@/types/gqlTypes';

const DEFAULT_ROWS_PER_PAGE = 25;

export type TableFilterType<T> = Partial<Record<keyof T, FilterType<T>>>;

export interface Props<
  Query,
  QueryVariables,
  RowDataType,
  FilterOptionsType = Record<string, any>,
  SortOptionsType = Record<string, string>,
> extends Omit<
  GenericTableProps<RowDataType>,
  | 'rows'
  | 'tablePaginationProps'
  | 'loading'
  | 'paginated'
  | 'noData'
  | 'verticalHiddenHeader'
  | 'columns'
> {
  columns?: DataColumnDef<RowDataType, QueryVariables>[];
  getColumnDefs?: (
    rows: RowDataType[],
    loading?: boolean
  ) => DataColumnDef<RowDataType, QueryVariables>[]; // dynamically define column defs based on current data
  filters?: TableFilterType<FilterOptionsType>;
  sortOptions?: SortOptionsType;
  defaultSortOption?: keyof SortOptionsType;
  defaultFilterValues?: Partial<FilterOptionsType>;
  showTopToolbar?: boolean;
  noSort?: boolean;
  queryVariables: QueryVariables;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  fetchPolicy?: WatchQueryFetchPolicy;
  pagePath: string; // path to pagination object from result data
  noData?: ReactNode | ((filters: Partial<FilterOptionsType>) => ReactNode);
  defaultPageSize?: number;
  rowsPerPageOptions?: number[];
  recordType?: string; // record type for inferring columns if not provided
  nonTablePagination?: boolean; // use external pagination variant instead of MUI table pagination
  clientSidePagination?: boolean; // whether to use client-side pagination
  paginationItemName?: string;
  header?: ReactNode;
  toolbars?: ReactNode[];
  fullHeight?: boolean; // used for scrollable table body
  tableDisplayOptionButtons?: TableFiltersProps<
    TableFilterType<FilterOptionsType>,
    SortOptionsType
  >['tableDisplayOptionButtons'];
  onCompleted?: (data: Query) => void;
  filterRows?: (rows: RowDataType) => boolean; // Client-side row filtering
  loading?: boolean;
  // pass setter for searchQueryId to the generic table component.
  // this is because some tables (like Client Search) manage all filter state themselves, not delegating to this component,
  // so this component (which performs the query) needs a way to communicate up the chain that we received a searchQueryId and it should go in the search params.
  setSearchQueryId?: (queryId: string) => void;
  // IF we wanted to have the request return the search query details (fields in the query) to avoid a double-query, then we might expand this:
  // setSearchQuery: (query: SearchQueryObject) -> void; // SearchQueryObject that includes id, firstName, etc.
  // that's not implemented in this illustration.

  // pass setter for searchTerm to the table, because most components that use a search term
  // (like ProjectEnrollmentsTable, etc) manage the search term themselves *even if* they otherwise delegate filter state to this component.
  // this is one of the things that's making me question whether it's worthwhile to bring *all* search param filter state into GenericTableWithData,
  // when searchTerm is the only one likely to have PII and it's already always managed by the parent.
  setSearchTerm?: (searchTerm: string) => void;
}

function allFieldColumns<T, QueryVariables>(
  recordType: string
): DataColumnDef<T, QueryVariables>[] {
  const schema = getSchemaForType(recordType);
  if (!schema) return [];

  return schema.fields.map(({ name }) => ({
    key: name,
    header: startCase(name),
    render: renderHmisField(recordType, name),
  }));
}

const GenericTableWithData = <
  Query,
  QueryVariables extends OperationVariables,
  RowDataType extends { id: string },
  FilterOptionsType extends Record<string, any> = Record<string, any>,
  SortOptionsType extends Record<string, string> = Record<string, string>,
>({
  filters,
  defaultFilterValues = {},
  showTopToolbar: showTopToolbarProp = false,
  sortOptions: sortOptionsProp,
  defaultSortOption: defaultSortOptionProp,
  queryVariables,
  queryDocument,
  pagePath,
  defaultPageSize = DEFAULT_ROWS_PER_PAGE,
  columns: columnsProp,
  getColumnDefs,
  recordType,
  fetchPolicy = 'cache-and-network',
  nonTablePagination = false,
  fullHeight = false,
  noSort,
  header,
  toolbars = [],
  noData,
  rowsPerPageOptions,
  tableDisplayOptionButtons,
  onCompleted,
  paginationItemName,
  filterRows,
  vertical,
  loading: loadingProp,
  setSearchQueryId,
  setSearchTerm,
  ...props
}: Props<
  Query,
  QueryVariables,
  RowDataType,
  FilterOptionsType,
  SortOptionsType
>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const previousQueryVariables = usePrevious(queryVariables);
  const [filterValues, setFilterValues] = useState(defaultFilterValues);
  const [sortOrder, setSortOrder] = useState<typeof defaultSortOptionProp>();

  // TODO(#7387) Optional column behavior is currently undefined/unsupported
  //  when columns are provided by getColumnDefs instead of the columns prop.
  const {
    optionalColumns,
    includedOptionalColumns,
    optionalQueryVariables,
    optionalColumnsMenuProps,
  } = useOptionalColumns<RowDataType, QueryVariables>({ columns: columnsProp });

  // if the filters change, return to the first page
  useEffect(() => {
    setPage(0);
  }, [filterValues]);

  const filterProps = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return;

    return {
      filters,
      filterValues,
      setFilterValues,
    };
  }, [filterValues, filters]);

  const effectiveSortOrder = useMemo<typeof sortOrder>(() => {
    if (sortOrder) return sortOrder;
    if (defaultSortOptionProp) return defaultSortOptionProp;
    return recordType
      ? getDefaultSortOptionForType(recordType) || undefined
      : undefined;
  }, [sortOrder, defaultSortOptionProp, recordType]);

  const offset = page * rowsPerPage;
  const limit = rowsPerPage;

  const [{ searchQueryId }, setSearchParams] = useSearchParamsState({
    paramsDefinition: {
      searchQueryId: { type: 'string', default: null },
    },
  });

  // this illustrates the double-query approach where:
  // 1. if we received a searchQueryId, query for it to find out what filters were used
  // 2. set those filters on the component so they're accurately reflected in the UI *and* the component queries for data with the correct filters
  const { data: searchQueryData } = useGetSearchQueryQuery({
    variables: { id: searchQueryId },
    skip: !searchQueryId,
    onCompleted: (data) => {
      if (data?.searchQuery?.params) {
        const { searchTerm, ...rest } = data.searchQuery.params;
        if (setSearchTerm && searchTerm) {
          // this might need to be standardized, sometimes it's searchTerm and sometimes it's textSearch
          setSearchTerm(searchTerm);
        }
        setFilterValues(rest);
        // this code makes assumptions about what filter values are set at the parent, vs. set in here with the filters table control.
        // those assumptions might not hold/generalize. we might need to change `setSearchTerm` to a more generic `setFilterQueryVariables`
      }
    },
  });

  const { data, loading, error, networkStatus } = useQuery<
    Query,
    QueryVariables
  >(queryDocument, {
    variables: {
      ...queryVariables, // Query variables passed directly from parent
      ...optionalQueryVariables, // Directives to include additional data for optional columns
      filters: {
        ...get(queryVariables, 'filters'), // Filter values passed directly from parent
        ...transformDynamicFilters<FilterOptionsType>(filters, filterValues), // Filters from FilterMenu
      },
      sortOrder: effectiveSortOrder,
      offset,
      limit,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy,
    // skip the query if searchQueryId is present but we haven't gotten the filters back yet.
    // this prevents double-query on page load
    skip: searchQueryId && !searchQueryData,
    onCompleted: (data) => {
      if (get(data, `${pagePath}.searchQueryId`)) {
        // if we got a searchQueryId back from the query, set it in the search params
        const searchQueryId = get(data, `${pagePath}.searchQueryId`) as string;
        setSearchParams({ searchQueryId });

        // pass it back up the chain so the parent knows. (currently used by ClientSearch, but not ProjectEnrollments)
        setSearchQueryId?.(searchQueryId);
      }
    },
  });

  const hasRefetched = useHasRefetched(networkStatus);

  // workaround to fire "onCompleted" even if data was fetched from cache
  useEffect(() => {
    if (onCompleted && data) onCompleted(data);
  }, [data, onCompleted]);

  useEffect(() => {
    if (!isEqual(previousQueryVariables, queryVariables)) {
      setPage(0);
    }
  }, [previousQueryVariables, queryVariables]);

  if (error) throw error;

  const rows = useMemo<RowDataType[]>(() => {
    const pageRows = (get(data, `${pagePath}.nodes`) || []) as RowDataType[];
    if (filterRows) return pageRows.filter(filterRows);
    return pageRows;
  }, [data, pagePath, filterRows]);

  const nodesCount = useMemo<number>(() => {
    return (get(data, `${pagePath}.nodesCount`) || 0) as number;
  }, [data, pagePath]);

  const nonTablePaginationProps = useMemo(() => {
    if (!nonTablePagination) return undefined;
    if (!nodesCount) return undefined;

    return {
      totalEntries: nodesCount,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      setOffset: (value: number) => setPage(value / rowsPerPage),
      itemName: paginationItemName,
    };
  }, [nonTablePagination, nodesCount, rowsPerPage, page, paginationItemName]);

  const tablePaginationProps = useMemo(() => {
    if (nonTablePagination) return undefined;
    if (!nodesCount) return undefined;

    return {
      rowsPerPage,
      page,
      rowsPerPageOptions,
      onPageChange: (_: any, newPage: number) => setPage(newPage),
      onRowsPerPageChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newRowsPerPage = parseInt(event.target.value) || defaultPageSize;
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      },
      count: nodesCount,
      labelRowsPerPage: `${pluralize(startCase(paginationItemName || recordType || 'Row'))} per page:`,
    };
  }, [
    nonTablePagination,
    nodesCount,
    rowsPerPage,
    page,
    rowsPerPageOptions,
    recordType,
    paginationItemName,
    defaultPageSize,
  ]);

  const columnDefs = useMemo(() => {
    if (columnsProp) return columnsProp;
    if (getColumnDefs) return getColumnDefs(rows, loading);
    if (recordType) return allFieldColumns(recordType);
    console.warn('No columns specified');
    return [] as DataColumnDef<RowDataType, QueryVariables>[];
  }, [columnsProp, getColumnDefs, loading, recordType, rows]);

  const showColumnDefs = useMemo(() => {
    return columnDefs.filter((col) => {
      return !(col.optional && !includedOptionalColumns.includes(col.key));
    });
  }, [columnDefs, includedOptionalColumns]);

  const sortOptions = useMemo(
    () =>
      sortOptionsProp ||
      (recordType
        ? (getSortOptionForType(recordType) as SortOptionsType)
        : undefined),
    [sortOptionsProp, recordType]
  );

  const noDataValue = useMemo(() => {
    if (typeof noData === 'function') return noData(filterValues);
    if (!filters) return noData;

    const isFiltered = Object.values(filterValues).some(hasMeaningfulValue);
    if (isFiltered)
      return `No ${pluralize(
        startCase(paginationItemName || recordType || 'record').toLowerCase()
      )} matching selected filters`;
    return noData;
  }, [noData, filterValues, filters, paginationItemName, recordType]);

  // If this is the first time loading, return loading (hide search headers)
  if (loading && !hasRefetched && !data) return <Loading />;

  const noResults = data && nodesCount === 0;
  const noResultsOnFirstLoad = noResults && !hasRefetched;

  // Hide pagination when possible
  const hidePagination = !hasRefetched && nodesCount <= defaultPageSize;

  const containerSx = fullHeight ? { height: '100%' } : undefined;

  const showTopToolbar =
    showTopToolbarProp ||
    !isEmpty(filters) ||
    (!isEmpty(sortOptions) && !noSort) ||
    !isEmpty(tableDisplayOptionButtons) ||
    !isEmpty(optionalColumns) ||
    !isEmpty(toolbars);

  return (
    <Stack spacing={1} sx={containerSx}>
      {header && !noResultsOnFirstLoad && (
        <Box sx={{ px: 2, py: 1, '.MuiInputLabel-root': { fontWeight: 600 } }}>
          {header}
        </Box>
      )}
      <Box sx={containerSx}>
        <GenericTable<RowDataType>
          loading={(loading && !data) || loadingProp}
          rows={rows}
          paginated={!nonTablePagination && !hidePagination}
          tablePaginationProps={
            nonTablePagination ? undefined : tablePaginationProps
          }
          tableContainerProps={{
            sx: {
              // makes sure border radius corners aren't cut off when top toolbar isn't shown
              borderRadius: 1,
            },
          }}
          columns={showColumnDefs}
          noData={loading ? 'Loading...' : noDataValue}
          vertical={vertical}
          verticalHiddenHeader={
            vertical ? `${recordType} attributes` : undefined
          }
          filterToolbar={
            showTopToolbar && (
              <>
                <Box
                  px={2}
                  py={1}
                  sx={(theme) => ({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  })}
                >
                  <TableControls
                    noSort={noSort}
                    loading={loading && !data}
                    tableDisplayOptionButtons={tableDisplayOptionButtons}
                    optionalColumns={optionalColumnsMenuProps}
                    sorting={
                      sortOptions
                        ? {
                            sortOptions,
                            sortOptionValue: effectiveSortOrder,
                            setSortOptionValue: setSortOrder,
                          }
                        : undefined
                    }
                    filters={filterProps}
                    pagination={{
                      limit,
                      offset,
                      totalEntries: nodesCount,
                      itemName:
                        paginationItemName ||
                        (recordType ? lowerFirst(recordType) : undefined),
                    }}
                  />
                </Box>
                {!isEmpty(toolbars) &&
                  toolbars.map((t) => (
                    <Box
                      key={String(t)}
                      px={2}
                      py={1}
                      sx={(theme) => ({
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      })}
                    >
                      {t}
                    </Box>
                  ))}
              </>
            )
          }
          {...props}
        />
        {nonTablePagination && nonTablePaginationProps && !hidePagination && (
          <Pagination
            {...nonTablePaginationProps}
            shape='rounded'
            size='small'
            gridProps={{
              sx: {
                py: 2,
                px: 1,
                borderTop: (theme) => `1px solid ${theme.palette.grey[200]}`,
              },
            }}
          />
        )}
      </Box>
    </Stack>
  );
};

const WrappedGenericTableWithData: typeof GenericTableWithData = (props) => (
  <Box sx={props.fullHeight ? { height: '100%' } : undefined}>
    <SentryErrorBoundary>
      <GenericTableWithData {...props} />
    </SentryErrorBoundary>
  </Box>
);

export default WrappedGenericTableWithData;
