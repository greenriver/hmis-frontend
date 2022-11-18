import {
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { Typography } from '@mui/material';
import { get, startCase } from 'lodash-es';
import { useMemo, useState } from 'react';

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
  pagePath: string;
  noData?: string;
  defaultPageSize?: number;
  recordType?: string; // record type for inferring columns if not provided
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
  noData = 'None found',
  defaultPageSize = DEFAULT_ROWS_PER_PAGE,
  columns,
  recordType,
  fetchPolicy,
  ...props
}: Props<Query, QueryVariables, RowDataType>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const { data, loading, error } = useQuery<Query, QueryVariables>(
    queryDocument,
    {
      variables: {
        ...queryVariables,
        offset: page * rowsPerPage,
        limit: rowsPerPage,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy,
    }
  );
  if (error) throw error;
  // if (!loading && !enrollment) throw Error('Client not found');

  const tablePaginationProps = useMemo(() => {
    if (!data) return undefined;
    const count = get(data, `${pagePath}.nodesCount`);
    if (!count) return undefined;

    return {
      rowsPerPage,
      page,
      onPageChange: (_: any, newPage: number) => setPage(newPage),
      onRowsPerPageChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newRowsPerPage = parseInt(event.target.value, defaultPageSize);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      },
      count,
    };
  }, [data, page, rowsPerPage, pagePath, defaultPageSize]);

  const columnDefs = useMemo(() => {
    if (columns) return columns;
    if (recordType) return allFieldColumns(recordType);
    console.warn('No columns specified');
    return [];
  }, [columns, recordType]);

  if (!loading && data && get(data, `${pagePath}.nodesCount`) === 0) {
    return <Typography sx={{ px: 2, pb: 1 }}>{noData}</Typography>;
  }

  return (
    <GenericTable<RowDataType>
      loading={loading}
      rows={get(data, `${pagePath}.nodes`) || []}
      paginated
      tablePaginationProps={tablePaginationProps}
      columns={columnDefs}
      {...props}
    />
  );
};

export default GenericTableWithData;
