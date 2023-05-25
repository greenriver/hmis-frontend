import {
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import { get, isEmpty, isEqual, startCase } from 'lodash-es';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import Pagination from '../../../components/elements/Pagination';
import { FilterType } from '../types';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import TableFilters from '@/components/elements/tableFilters/TableFilters';
import useHasRefetched from '@/hooks/useHasRefetched';
import usePrevious from '@/hooks/usePrevious';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import {
  getDefaultSortOptionForType,
  getFilter,
  getInputTypeForRecordType,
  getSortOptionForType,
} from '@/modules/hmis/components/HmisFilter';
import {
  getSchemaForInputType,
  getSchemaForType,
} from '@/modules/hmis/hmisUtil';

const DEFAULT_ROWS_PER_PAGE = 10;

export type TableFilterType<T> = Partial<Record<keyof T, FilterType<T>>>;

export interface Props<
  Query,
  QueryVariables,
  RowDataType,
  FilterOptionsType = Record<string, any>,
  SortOptionsType = Record<string, string>
> extends Omit<
    GenericTableProps<RowDataType>,
    'rows' | 'tablePaginationProps' | 'loading' | 'paginated'
  > {
  filters?:
    | TableFilterType<FilterOptionsType>
    | ((
        baseFilters: TableFilterType<FilterOptionsType>
      ) => TableFilterType<FilterOptionsType>);
  sortOptions?: SortOptionsType;
  defaultSortOption?: keyof SortOptionsType;
  defaultFilters?: Partial<FilterOptionsType>;
  showFilters?: boolean;
  queryVariables: QueryVariables;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  fetchPolicy?: WatchQueryFetchPolicy;
  pagePath?: string; // path to page, if paginated results
  rowsPath?: string; // path to data rows, if non-paginated results
  noData?: string;
  defaultPageSize?: number;
  recordType?: string; // record type for inferring columns if not provided
  filterInputType?: string; // filter input type type for inferring filters if not provided
  nonTablePagination?: boolean; // use external pagination variant instead of MUI table pagination
  clientSidePagination?: boolean; // whether to use client-side pagination
  header?: ReactNode;
  fullHeight?: boolean; // used for scrollable table body
}

function allFieldColumns<T>(recordType: string): ColumnDef<T>[] {
  const schema = getSchemaForType(recordType);
  if (!schema) return [];

  return schema.fields.map(({ name }) => ({
    key: name,
    header: startCase(name),
    render: renderHmisField(recordType, name),
  }));
}

function allFieldFilters<T>(
  recordType: string,
  filterInputType: string
): Partial<Record<keyof T, FilterType<T>>> {
  const schema = getSchemaForInputType(filterInputType);
  if (!schema) return {};

  const result: Partial<Record<keyof T, FilterType<T>>> = {};

  schema.args.forEach(({ name }) => {
    const filter = getFilter(recordType, filterInputType, name);

    if (filter) result[name as keyof T] = filter;
  });

  return result;
}

const GenericTableWithData = <
  Query,
  QueryVariables,
  RowDataType extends { id: string },
  FilterOptionsType extends Record<string, any> = Record<string, any>,
  SortOptionsType extends Record<string, string> = Record<string, string>
>({
  filters,
  defaultFilters = {},
  showFilters = false,
  sortOptions: sortOptionsProp,
  defaultSortOption: defaultSortOptionProp,
  queryVariables,
  queryDocument,
  pagePath,
  rowsPath,
  noData = 'None found',
  defaultPageSize = DEFAULT_ROWS_PER_PAGE,
  columns,
  recordType,
  filterInputType: filterInputTypeProp,
  fetchPolicy,
  nonTablePagination = false,
  fullHeight = false,
  header,
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
  const [filterValues, setFilterValues] = useState(defaultFilters);
  const [sortOrder, setSortOrder] = useState<typeof defaultSortOptionProp>(
    defaultSortOptionProp ||
      (recordType
        ? (getDefaultSortOptionForType(recordType) as keyof SortOptionsType)
        : undefined)
  );

  const offset = page * rowsPerPage;
  const limit = rowsPerPage;

  const { data, loading, error, networkStatus } = useQuery<
    Query,
    QueryVariables
  >(queryDocument, {
    variables: {
      ...queryVariables,
      filters: filterValues,
      sortOrder,
      ...(!rowsPath && {
        offset,
        limit,
      }),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy,
  });

  const hasRefetched = useHasRefetched(networkStatus);

  useEffect(() => {
    if (!isEqual(previousQueryVariables, queryVariables)) {
      setPage(0);
    }
  }, [previousQueryVariables, queryVariables]);

  if (error) throw error;

  const rows = useMemo(() => {
    if (pagePath) return get(data, `${pagePath}.nodes`) || [];
    if (rowsPath) {
      const all = get(data, rowsPath) || [];
      const startIndex = page * rowsPerPage;
      return all.slice(startIndex, startIndex + rowsPerPage);
    }
    return data;
  }, [data, pagePath, rowsPath, rowsPerPage, page]);

  const nodesCount = useMemo(() => {
    if (pagePath) return get(data, `${pagePath}.nodesCount`) || 0;
    if (rowsPath) return (get(data, rowsPath) || []).length;
    return rows.length;
  }, [data, pagePath, rowsPath, rows]);

  const nonTablePaginationProps = useMemo(() => {
    if (!nonTablePagination) return undefined;
    if (!nodesCount) return undefined;

    return {
      totalEntries: nodesCount,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      setOffset: (value: number) => setPage(value / rowsPerPage),
    };
  }, [nodesCount, page, rowsPerPage, nonTablePagination]);

  const tablePaginationProps = useMemo(() => {
    if (nonTablePagination) return undefined;
    if (!nodesCount) return undefined;

    return {
      rowsPerPage,
      page,
      onPageChange: (_: any, newPage: number) => setPage(newPage),
      onRowsPerPageChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newRowsPerPage = parseInt(event.target.value) || defaultPageSize;
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      },
      count: nodesCount,
    };
  }, [nodesCount, page, rowsPerPage, defaultPageSize, nonTablePagination]);

  const columnDefs = useMemo(() => {
    if (columns) return columns;
    if (recordType) return allFieldColumns(recordType);
    console.warn('No columns specified');
    return [];
  }, [columns, recordType]);

  const filterDefs = useMemo(() => {
    const filterInputType =
      filterInputTypeProp ||
      (recordType ? getInputTypeForRecordType(recordType) : undefined);
    if (!filters && !(filterInputType && recordType)) return undefined;

    const derivedFilters =
      filterInputType && recordType
        ? allFieldFilters(recordType, filterInputType)
        : {};
    return {
      ...derivedFilters,
      ...(typeof filters === 'function'
        ? filters(derivedFilters)
        : filters || {}),
    };
  }, [filters, recordType, filterInputTypeProp]);

  const sortOptions = useMemo(
    () =>
      sortOptionsProp ||
      (recordType
        ? (getSortOptionForType(recordType) as SortOptionsType)
        : undefined),
    [sortOptionsProp, recordType]
  );

  // If this is the first time loading, return loading (hide search headers)
  if (loading && !hasRefetched) return <Loading />;

  const noResults = !loading && data && nodesCount === 0;
  const noResultsOnFirstLoad = noResults && !hasRefetched;

  // Hide pagination when possible
  const hidePagination = !hasRefetched && nodesCount <= defaultPageSize;

  const containerSx = fullHeight ? { height: '100%' } : undefined;
  return (
    <Stack spacing={1} sx={containerSx}>
      {header && !noResultsOnFirstLoad && (
        <Box sx={{ px: 2, py: 1, '.MuiInputLabel-root': { fontWeight: 600 } }}>
          {header}
        </Box>
      )}
      <Box sx={containerSx}>
        {noResults ? (
          <Typography sx={{ px: 2, py: 2 }}>{noData}</Typography>
        ) : (
          <>
            {showFilters && (
              <Box
                px={2}
                py={1}
                sx={(theme) => ({
                  borderBottom: `1px solid ${theme.palette.divider}`,
                })}
              >
                <TableFilters
                  loading={loading}
                  sorting={
                    sortOptions
                      ? {
                          sortOptions,
                          sortOptionValue: sortOrder,
                          setSortOptionValue: setSortOrder,
                        }
                      : undefined
                  }
                  filters={
                    !isEmpty(filterDefs)
                      ? {
                          filters: filterDefs,
                          filterValues,
                          setFilterValues,
                        }
                      : undefined
                  }
                  pagination={{
                    limit,
                    offset,
                    totalEntries: nodesCount,
                  }}
                />
              </Box>
            )}
            <GenericTable<RowDataType>
              loading={loading}
              rows={rows}
              paginated={!nonTablePagination && !hidePagination}
              tablePaginationProps={
                nonTablePagination ? undefined : tablePaginationProps
              }
              columns={columnDefs}
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
                    borderTop: (theme) =>
                      `1px solid ${theme.palette.grey[200]}`,
                  },
                }}
              />
            )}
          </>
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
