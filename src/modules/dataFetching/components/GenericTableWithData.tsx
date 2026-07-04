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

import { DataColumnDef } from '../types';

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
import type { TablePaginationState } from '@/hooks/useTablePagination';
import { DEFAULT_TABLE_PAGE_SIZE } from '@/modules/dataFetching/constants';
import { useNetworkDataReady } from '@/modules/dataFetching/hooks/useNetworkDataReady';
import { useOptionalColumns } from '@/modules/dataFetching/hooks/useOptionalColumns';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import { getSchemaForType } from '@/modules/hmis/hmisUtil';
import { TableFilterType } from '@/types/tableFilterTypes';
import { transformDynamicFilters } from '@/utils/tableFilterUtil';
import {
  getSortOptionForType,
  getDefaultSortOptionForType,
} from '@/utils/tableSortUtil';

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
  /** Filter config (which filters exist, their type/labels). From useTableFilters(). */
  filters?: TableFilterType<FilterOptionsType>;
  sortOptions?: SortOptionsType;
  defaultSortOption?: keyof SortOptionsType;
  /** Uncontrolled Filters: initial filter values. Ignored when filterValues + onFilterChange are both provided. */
  defaultFilterValues?: Partial<FilterOptionsType>;
  /** Controlled Filters: current filter values. Use with onFilterChange so the table does not own filter state (e.g. URL-backed via useTableFilters). */
  filterValues?: Partial<FilterOptionsType>;
  /** Controlled Filters: called when user changes filters. Use with filterValues so the parent can persist state (e.g. to URL). */
  onFilterChange?: (values: Partial<FilterOptionsType>) => void;
  showTopToolbar?: boolean;
  noSort?: boolean;
  queryVariables: QueryVariables;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  fetchPolicy?: WatchQueryFetchPolicy;
  pagePath: string; // path to pagination object from result data
  noData?: ReactNode | ((filters: Partial<FilterOptionsType>) => ReactNode);
  defaultPageSize?: number;
  rowsPerPageOptions?: number[];
  /** Controlled Pagination: current page/page size and setters. Use when pagination state should live outside the table, e.g. URL-backed via useTablePagination. */
  pagination?: TablePaginationState;
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
  /** Fires when data is available (network or cache). Use to gate actions until results are shown, e.g. to reduce duplicate client record creation. */
  onDataReady?: (data: Query) => void;
  /** Fires when data is available after a network fetch completes. */
  onNetworkDataReady?: (data: Query) => void;
  filterRows?: (rows: RowDataType) => boolean; // Client-side row filtering
  loading?: boolean;
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
  filterValues: filterValuesProp,
  onFilterChange,
  showTopToolbar: showTopToolbarProp = false,
  sortOptions: sortOptionsProp,
  defaultSortOption: defaultSortOptionProp,
  queryVariables,
  queryDocument,
  pagePath,
  defaultPageSize = DEFAULT_TABLE_PAGE_SIZE,
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
  pagination,
  tableDisplayOptionButtons,
  onDataReady,
  onNetworkDataReady,
  paginationItemName,
  filterRows,
  vertical,
  loading: loadingProp,
  ...props
}: Props<
  Query,
  QueryVariables,
  RowDataType,
  FilterOptionsType,
  SortOptionsType
>) => {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    useState(defaultPageSize);
  const previousQueryVariables = usePrevious(queryVariables);
  const [internalFilterValues, setInternalFilterValues] =
    useState(defaultFilterValues);
  const [sortOrder, setSortOrder] = useState<typeof defaultSortOptionProp>();

  const page = pagination?.page ?? internalPage;
  const rowsPerPage = pagination?.rowsPerPage ?? internalRowsPerPage;
  const setPage = pagination?.setPage ?? setInternalPage;
  const setRowsPerPage = pagination?.setRowsPerPage ?? setInternalRowsPerPage;
  const hasControlledPagination = !!pagination;

  const filterValues =
    filterValuesProp !== undefined && onFilterChange
      ? filterValuesProp
      : internalFilterValues;
  const previousFilterValues = usePrevious(filterValues);
  const setFilterValues =
    filterValuesProp !== undefined && onFilterChange
      ? onFilterChange
      : setInternalFilterValues;

  // TODO(#7387) Optional column behavior is currently undefined/unsupported
  //  when columns are provided by getColumnDefs instead of the columns prop.
  const {
    optionalColumns,
    includedOptionalColumns,
    optionalQueryVariables,
    optionalColumnsMenuProps,
  } = useOptionalColumns<RowDataType, QueryVariables>({ columns: columnsProp });

  // If filters change (by value), return to the first page. Use deep comparison so URL-backed
  // filter objects that get a new reference each render do not reset pagination.
  useEffect(() => {
    if (
      previousFilterValues !== undefined &&
      !isEqual(previousFilterValues, filterValues)
    ) {
      setPage(0);
    }
  }, [previousFilterValues, filterValues, setPage]);

  const filterProps = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return;

    return {
      filters,
      filterValues,
      setFilterValues,
    };
  }, [filterValues, filters, setFilterValues]);

  const effectiveSortOrder = useMemo<typeof sortOrder>(() => {
    if (sortOrder) return sortOrder;
    if (defaultSortOptionProp) return defaultSortOptionProp;
    return recordType
      ? getDefaultSortOptionForType(recordType) || undefined
      : undefined;
  }, [sortOrder, defaultSortOptionProp, recordType]);

  const offset = page * rowsPerPage;
  const limit = rowsPerPage;

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
  });

  const hasRefetched = useHasRefetched(networkStatus);

  // Fire onNetworkDataReady after the query moves from an in-flight networkStatus to ready.
  // Only runs the callback when the table has data to show from a network call, not a cache hit.
  useNetworkDataReady({ data, networkStatus, callback: onNetworkDataReady });

  // Fire onDataReady when data is available from either cache or network.
  // Runs the callback whenever the table has data to show.
  useEffect(() => {
    if (onDataReady && data) onDataReady(data);
  }, [onDataReady, data]);

  useEffect(() => {
    if (
      previousQueryVariables !== undefined &&
      !isEqual(previousQueryVariables, queryVariables)
    ) {
      setPage(0);
    }
  }, [previousQueryVariables, queryVariables, setPage]);

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
  }, [
    nonTablePagination,
    nodesCount,
    rowsPerPage,
    page,
    setPage,
    paginationItemName,
  ]);

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
        if (!hasControlledPagination) setPage(0);
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
    setPage,
    setRowsPerPage,
    hasControlledPagination,
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

  // Hide pagination when possible. Compare against the active rowsPerPage, not the default,
  // so an initial URL load with a smaller pageSize still shows controls when more pages exist.
  const hidePagination = !hasRefetched && nodesCount <= rowsPerPage;

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
