import {
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import { get, isEqual, startCase } from 'lodash-es';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import Pagination from '../../../components/elements/Pagination';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import useHasRefetched from '@/hooks/useHasRefetched';
import usePrevious from '@/hooks/usePrevious';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { renderHmisField } from '@/modules/hmis/components/HmisField';
import { getSchemaForType } from '@/modules/hmis/hmisUtil';

const DEFAULT_ROWS_PER_PAGE = 10;

export interface Props<Query, QueryVariables, RowDataType>
  extends Omit<
    GenericTableProps<RowDataType>,
    'rows' | 'tablePaginationProps' | 'loading' | 'paginated'
  > {
  queryVariables: QueryVariables;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  fetchPolicy?: WatchQueryFetchPolicy;
  pagePath?: string; // path to page, if paginated results
  rowsPath?: string; // path to data rows, if non-paginated results
  noData?: string;
  defaultPageSize?: number;
  recordType?: string; // record type for inferring columns if not provided
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

const GenericTableWithData = <
  Query,
  QueryVariables,
  RowDataType extends { id: string }
>({
  queryVariables,
  queryDocument,
  pagePath,
  rowsPath,
  noData = 'None found',
  defaultPageSize = DEFAULT_ROWS_PER_PAGE,
  columns,
  recordType,
  fetchPolicy,
  nonTablePagination = false,
  fullHeight = false,
  header,
  ...props
}: Props<Query, QueryVariables, RowDataType>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const previousQueryVariables = usePrevious(queryVariables);

  const { data, loading, error, networkStatus } = useQuery<
    Query,
    QueryVariables
  >(queryDocument, {
    variables: {
      ...queryVariables,
      ...(!rowsPath && {
        offset: page * rowsPerPage,
        limit: rowsPerPage,
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
          <Typography sx={{ px: 2, pt: 1, pb: 2 }}>{noData}</Typography>
        ) : (
          <>
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

const WrappedGenericTableWithData = <
  Query,
  QueryVariables,
  RowDataType extends { id: string }
>(
  props: Props<Query, QueryVariables, RowDataType>
) => (
  <Box sx={props.fullHeight ? { height: '100%' } : undefined}>
    <SentryErrorBoundary>
      <GenericTableWithData {...props} />
    </SentryErrorBoundary>
  </Box>
);

export default WrappedGenericTableWithData;
