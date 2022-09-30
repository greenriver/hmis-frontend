import {
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TablePaginationProps,
  TableProps,
  TableRow,
  Theme,
} from '@mui/material';
import { ReactNode } from 'react';

import Loading from './Loading';

type AttributeName<T> = keyof T;
type RenderFunction<T> = (value: T) => React.ReactNode;

function isPrimitive<T>(value: any): value is AttributeName<T> {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isRenderFunction<T>(value: any): value is RenderFunction<T> {
  return typeof value === 'function';
}

export interface ColumnDef<T> {
  header: string | ReactNode;
  render: AttributeName<T> | RenderFunction<T>;
  width?: string;
  // unique key for element. if not provided, header is used.
  key?: string;
}
export interface Props<T> {
  rows: T[];
  handleRowClick?: (row: T) => void;
  columns: ColumnDef<T>[];
  paginated?: boolean;
  loading?: boolean;
  tablePaginationProps?: TablePaginationProps;
  actionRow?: ReactNode;
  tableProps?: TableProps;
  rowSx?: (row: T) => SxProps<Theme>;
}

const clickableRowStyles = {
  '&:focus': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
  cursor: 'pointer',
};

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  columns,
  paginated = false,
  loading = false,
  tablePaginationProps,
  actionRow,
  tableProps,
  rowSx,
}: Props<T>) => {
  const hasHeaders = columns.find((c) => !!c.header);
  if (loading) return <Loading />;
  return (
    <TableContainer>
      <Table {...tableProps}>
        <TableHead>
          {hasHeaders && (
            <TableRow>
              {columns.map(({ header, key }) => (
                <TableCell
                  sx={{ fontWeight: 600 }}
                  key={key || (typeof header === 'string' ? header : '')}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          )}
          {/* {loading && (
            <TableRow>
              <th colSpan={columns.length}>
                <LinearProgress />
              </th>
            </TableRow>
          )} */}
        </TableHead>
        <TableBody>
          {rows &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  ...(!!handleRowClick && clickableRowStyles),
                  ...(!!rowSx && rowSx(row)),
                }}
                hover={!!handleRowClick}
                onClick={handleRowClick ? () => handleRowClick(row) : undefined}
                onKeyUp={
                  handleRowClick
                    ? (event) => event.key === 'Enter' && handleRowClick(row)
                    : undefined
                }
                tabIndex={0}
              >
                {columns.map(({ header, key, render, width }) => {
                  return (
                    <TableCell
                      key={key || (typeof header === 'string' ? header : '')}
                      width={width}
                    >
                      <>
                        {isPrimitive<T>(render) && row[render]}
                        {isRenderFunction<T>(render) && render(row)}
                      </>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          {actionRow}
        </TableBody>
        {paginated &&
          rows &&
          tablePaginationProps &&
          tablePaginationProps.count > rows.length && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  SelectProps={{
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  }}
                  sx={{ borderBottom: 'none' }}
                  {...tablePaginationProps}
                />
              </TableRow>
            </TableFooter>
          )}
      </Table>
    </TableContainer>
  );
};

export default GenericTable;
