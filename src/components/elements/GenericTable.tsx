import {
  Box,
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
import { get, isNil } from 'lodash-es';
import { ReactNode } from 'react';
import { To } from 'react-router-dom';

import Loading from './Loading';
import RouterLink from './RouterLink';

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
  header?: string | ReactNode;
  render: AttributeName<T> | RenderFunction<T>;
  width?: string;
  minWidth?: string;
  // unique key for element. if not provided, header is used.
  key?: string;
  // whether to show link treatment for this cell. rowLinkTo must be provided.
  linkTreatment?: boolean;
  // whether to NOT link this cell even when the whole row is linked using rowLinkTo. Use if there are clickable elements in the cell.
  dontLink?: boolean;
  // aria label, for use with linkTreatment
  ariaLabel?: (row: T) => string;
  textAlign?: 'center' | 'end' | 'justify' | 'left' | 'right' | 'start';
}
export interface Props<T> {
  rows: T[];
  handleRowClick?: (row: T) => void;
  rowLinkTo?: (row: T) => To;
  columns?: ColumnDef<T>[];
  paginated?: boolean;
  loading?: boolean;
  tablePaginationProps?: TablePaginationProps;
  actionRow?: ReactNode;
  tableProps?: TableProps;
  vertical?: boolean;
  noHead?: boolean;
  renderVerticalHeaderCell?: RenderFunction<T>;
  rowSx?: (row: T) => SxProps<Theme>;
  headerCellSx?: (def: ColumnDef<T>) => SxProps<Theme>;
}

const clickableRowStyles = {
  '&:focus': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
  cursor: 'pointer',
};

const HeaderCell = ({
  columnDef: { header },
  sx,
}: {
  columnDef: ColumnDef<any>;
  sx?: SxProps<Theme>;
}) => (
  <TableCell
    sx={{
      borderBottomColor: 'borders.dark',
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      pb: 1,
      ...sx,
    }}
  >
    {header}
  </TableCell>
);

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  rowLinkTo,
  columns = [],
  paginated = false,
  loading = false,
  vertical = false,
  renderVerticalHeaderCell,
  tablePaginationProps,
  actionRow,
  tableProps,
  noHead = false,
  rowSx,
  headerCellSx,
}: Props<T>) => {
  const hasHeaders = columns.find((c) => !!c.header);
  if (loading) return <Loading />;

  const renderCellContents = (row: T, render: ColumnDef<T>['render']) => {
    if (isRenderFunction<T>(render)) return <>{render(row)}</>;
    if (isPrimitive<T>(render)) {
      const val = get(row, render);
      if (!isNil(val)) return <>{`${val}`}</>;
    }
    return null;
  };

  const verticalCellSx = (idx: number): SxProps<Theme> => ({
    border: (theme: Theme) => `1px solid ${theme.palette.grey[200]}`,
    backgroundColor: (theme: Theme) =>
      idx & 1 ? undefined : theme.palette.background.default,
  });

  const key = (def: ColumnDef<T>) =>
    def.key || (typeof def.header === 'string' ? def.header : '');

  const tableHead = noHead ? null : vertical ? (
    <TableHead sx={{ '.MuiTableCell-head': { verticalAlign: 'bottom' } }}>
      {renderVerticalHeaderCell && (
        <TableRow>
          <TableCell key='empty' sx={{ backgroundColor: 'background.paper' }} />
          {rows.map((row, idx) => (
            <TableCell key={row.id} sx={verticalCellSx(idx)}>
              {renderVerticalHeaderCell(row)}
            </TableCell>
          ))}
        </TableRow>
      )}
    </TableHead>
  ) : (
    <TableHead>
      {hasHeaders && (
        <TableRow>
          {columns.map((def, i) => (
            <HeaderCell
              columnDef={def}
              key={key(def) || i}
              sx={{
                ...(headerCellSx ? headerCellSx(def) : undefined),
                textAlign: def.textAlign,
              }}
            />
          ))}
        </TableRow>
      )}
    </TableHead>
  );

  return (
    <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
      <Table
        size='medium'
        sx={{ height: vertical ? '100%' : '1px' }}
        {...tableProps}
      >
        {tableHead}
        <TableBody>
          {vertical &&
            columns.map((def, i) => (
              <TableRow key={key(def) || i}>
                <HeaderCell
                  columnDef={def}
                  sx={{ ...verticalCellSx(1), width: '350px' }}
                  key={key(def)}
                />
                {rows.map((row, idx) => (
                  <TableCell key={row.id} sx={{ ...verticalCellSx(idx) }}>
                    {renderCellContents(row, def.render)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!vertical &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  // '&:last-child td, &:last-child th': { border: 0 },
                  ...(!!(handleRowClick || rowLinkTo) && clickableRowStyles),
                  ...(!!rowSx && rowSx(row)),
                }}
                hover={!!(handleRowClick || rowLinkTo)}
                onClick={handleRowClick ? () => handleRowClick(row) : undefined}
                onKeyUp={
                  handleRowClick
                    ? (event) => event.key === 'Enter' && handleRowClick(row)
                    : undefined
                }
                tabIndex={handleRowClick ? 0 : undefined}
              >
                {columns.map((def, index) => {
                  const {
                    render,
                    width,
                    minWidth,
                    linkTreatment,
                    ariaLabel,
                    dontLink = false,
                    textAlign,
                  } = def;
                  const isFirstLinkWithTreatment =
                    columns.findIndex((c) => c.linkTreatment) === index;
                  const isLinked = rowLinkTo && !dontLink;
                  const onClickLinkTreatment =
                    handleRowClick && !dontLink && linkTreatment
                      ? {
                          color: 'links',
                          textDecoration: 'underline',
                          textDecorationColor: 'links',
                        }
                      : undefined;
                  return (
                    <TableCell
                      key={key(def) || index}
                      sx={{
                        width,
                        minWidth,
                        ...(isLinked ? { p: 0 } : undefined),
                        textAlign,
                        ...onClickLinkTreatment,
                      }}
                    >
                      {isLinked ? (
                        <RouterLink
                          to={rowLinkTo(row)}
                          aria-label={ariaLabel && ariaLabel(row)}
                          plain={!linkTreatment}
                          data-testid={linkTreatment && 'table-linkedCell'}
                          sx={{
                            height: '100%',
                            verticalAlign: 'middle',
                            display: 'block',
                            '&.Mui-focusVisible': {
                              outlineOffset: '-2px',
                            },
                          }}
                          tabIndex={isFirstLinkWithTreatment ? 0 : '-1'}
                        >
                          <Box
                            component='span'
                            sx={{
                              display: 'flex',
                              height: '100%',
                              alignItems: 'center',
                              // TODO may want to adjust for small table size
                              px: 2,
                              py: 1,
                            }}
                          >
                            {renderCellContents(row, render)}
                          </Box>
                        </RouterLink>
                      ) : (
                        renderCellContents(row, render)
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          {actionRow}
        </TableBody>
        {paginated && tablePaginationProps && (
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
