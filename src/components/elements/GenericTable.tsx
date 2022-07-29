import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@mui/material';

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

interface Columns<T> {
  header: string;
  render: AttributeName<T> | RenderFunction<T>;
}
interface Props<T> {
  rows: T[];
  handleRowClick?: (row: T) => void;
  columns: Columns<T>[];
}

const clickableRowStyles = {
  '&:focus': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
  cursor: 'pointer',
};

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  columns,
}: Props<T>) => {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            {columns.map(({ header }) => (
              <TableCell sx={{ fontWeight: 600 }} key={header}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                ...(!!handleRowClick && clickableRowStyles),
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
              {columns.map(({ header, render }) => {
                return (
                  <TableCell key={header}>
                    <>
                      {isPrimitive<T>(render) && row[render]}
                      {isRenderFunction<T>(render) && render(row)}
                    </>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GenericTable;
