import {
  Table,
  TableBody,
  TableBodyProps,
  TableCell,
  TableCellProps,
  TableHead,
  TableHeadProps,
  TableProps,
  TableRow,
  TableRowProps,
} from '@mui/material';
import React from 'react';

export type SimpleTableProps<T extends { id: string }> = {
  columns: {
    name: string;
    label?: React.ReactNode;
    render: (row: T) => React.ReactNode;
  }[];
  rows: T[];
  headers?: boolean;
  TableProps?: TableProps;
  TableHeadProps?: TableHeadProps;
  TableBodyProps?: TableBodyProps;
  TableRowProps?: TableRowProps;
  TableBodyRowProps?: TableRowProps;
  TableHeadRowProps?: TableRowProps;
  TableCellProps?: TableCellProps;
  TableBodyCellProps?: TableCellProps;
  TableHeadCellProps?: TableCellProps;
};

const SimpleTable = <T extends { id: string }>({
  rows,
  columns,
  headers = false,
  TableProps = {},
  TableHeadProps = {},
  TableBodyProps = {},
  TableRowProps = {},
  TableBodyRowProps = {},
  TableHeadRowProps = {},
  TableCellProps = {},
  TableBodyCellProps = {},
  TableHeadCellProps = {},
}: SimpleTableProps<T>): JSX.Element => {
  return (
    <Table {...TableProps}>
      {headers && (
        <TableHead {...TableHeadProps}>
          <TableRow {...TableRowProps} {...TableHeadRowProps}>
            {columns.map((col) => (
              <TableCell
                {...TableCellProps}
                {...TableHeadCellProps}
                key={col.name}
              >
                {col.label || col.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody {...TableBodyProps}>
        {rows.map((row) => (
          <TableRow {...TableRowProps} {...TableBodyRowProps} key={row.id}>
            {columns.map((col) => (
              <TableCell
                {...TableCellProps}
                {...TableBodyCellProps}
                key={[row.id, col.name].join(':')}
              >
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SimpleTable;
