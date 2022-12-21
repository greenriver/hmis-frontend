import {
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { Typography } from '@mui/material';
import { get, startCase } from 'lodash-es';
import { useMemo, useState } from 'react';

import Pagination from './Pagination';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
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
  ...props
}: Props<Query, QueryVariables, RowDataType>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const { data, loading, error } = useQuery<Query, QueryVariables>(
    queryDocument,
    {
      variables: {
        ...queryVariables,
        ...(!rowsPath && {
          offset: page * rowsPerPage,
          limit: rowsPerPage,
        }),
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy,
    }
  );

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

  if (!loading && data && nodesCount === 0) {
    return <Typography sx={{ px: 2, pb: 1 }}>{noData}</Typography>;
  }

  return (
    <>
      <GenericTable<RowDataType>
        loading={loading}
        rows={rows}
        paginated={!nonTablePagination}
        tablePaginationProps={
          nonTablePagination ? undefined : tablePaginationProps
        }
        columns={columnDefs}
        {...props}
      />
      {nonTablePagination &&
        nonTablePaginationProps &&
        nonTablePaginationProps.totalEntries > rows.length && (
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
    </>
  );
};

export default GenericTableWithData;
