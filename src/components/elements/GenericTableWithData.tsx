import { TypedDocumentNode, useQuery } from '@apollo/client';
import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';

const DEFAULT_ROWS_PER_PAGE = 10;

interface Props<Query, QueryVariables, RowDataType>
  extends Omit<
    GenericTableProps<RowDataType>,
    'rows' | 'tablePaginationProps' | 'loading' | 'paginated'
  > {
  queryVariables: QueryVariables;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  toNodes: (data: Query) => RowDataType[];
  toNodesCount: (data: Query) => number | undefined;
  noData?: string;
}

const GenericTableWithData = <
  Query,
  QueryVariables,
  RowDataType extends { id: string }
>({
  queryVariables,
  queryDocument,
  toNodesCount,
  toNodes,
  noData = 'None found',
  ...props
}: Props<Query, QueryVariables, RowDataType>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const { data, loading, error } = useQuery<Query, QueryVariables>(
    queryDocument,
    {
      variables: {
        ...queryVariables,
        offset: page * rowsPerPage,
        limit: rowsPerPage,
      },
      notifyOnNetworkStatusChange: true,
      // FIXME we shouldn't need this, but the cache for GetClientEnrollments
      // isn't updated after a new enrollment is created. Figure out how to
      // fix that with cache policies and remove this.
      fetchPolicy: 'cache-and-network',
    }
  );
  if (error) throw error;
  // if (!loading && !enrollment) throw Error('Client not found');

  const tablePaginationProps = useMemo(() => {
    if (!data) return undefined;
    const count = toNodesCount(data);
    if (!count) return undefined;

    return {
      rowsPerPage,
      page,
      onPageChange: (_: any, newPage: number) => setPage(newPage),
      onRowsPerPageChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newRowsPerPage = parseInt(
          event.target.value,
          DEFAULT_ROWS_PER_PAGE
        );
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      },
      count,
    };
  }, [data, page, rowsPerPage, toNodesCount]);

  if (!loading && data && toNodesCount(data) === 0) {
    return <Typography sx={{ px: 2, pb: 1 }}>{noData}</Typography>;
  }

  return (
    <GenericTable<RowDataType>
      loading={loading}
      rows={data ? toNodes(data) : []}
      paginated
      tablePaginationProps={tablePaginationProps}
      {...props}
    />
  );
};

export default GenericTableWithData;
