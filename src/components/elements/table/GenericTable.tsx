import {
  Box,
  Checkbox,
  LinearProgress,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableContainerProps,
  TableFooter,
  TableHead,
  TablePagination,
  TablePaginationProps,
  TableProps,
  TableRow,
  Theme,
} from '@mui/material';
import { get, includes, isNil, without } from 'lodash-es';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { To } from 'react-router-dom';

import Loading from '../Loading';
import RouterLink from '../RouterLink';

import EnhancedTableToolbar, {
  EnhancedTableToolbarProps,
} from './EnhancedTableToolbar';
import {
  ColumnDef,
  isPrimitive,
  isRenderFunction,
  RenderFunction,
} from './types';

export interface Props<T> {
  rows: T[];
  handleRowClick?: (row: T) => void;
  rowLinkTo?: (row: T) => To | null | undefined;
  columns?: ColumnDef<T>[];
  paginated?: boolean;
  loading?: boolean;
  loadingVariant?: 'circular' | 'linear';
  tablePaginationProps?: TablePaginationProps;
  tableContainerProps?: TableContainerProps;
  actionRow?: ReactNode;
  tableProps?: TableProps;
  vertical?: boolean;
  noHead?: boolean;
  renderVerticalHeaderCell?: RenderFunction<T>;
  rowSx?: (row: T) => SxProps<Theme>;
  headerCellSx?: (def: ColumnDef<T>) => SxProps<Theme>;
  selectable?: 'row' | 'checkbox'; // selectable by clicking row or by clicking checkbox
  isRowSelectable?: (row: T) => boolean;
  onChangeSelectedRowIds?: (ids: readonly string[]) => void;
  EnhancedTableToolbarProps?: Omit<
    EnhancedTableToolbarProps<T>,
    'selectedIds' | 'rows'
  >;
  filterToolbar?: ReactNode;
  noData?: ReactNode;
  renderRow?: (row: T) => ReactNode;
  condensed?: boolean;
}

const clickableRowStyles = {
  '&:focus': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
  cursor: 'pointer',
};

const HeaderCell = ({
  children,
  sx,
  padding,
}: {
  children: ReactNode;
  padding?: TableCellProps['padding'];
  sx?: SxProps<Theme>;
}) => (
  <TableCell
    padding={padding}
    sx={{
      borderBottomColor: 'borders.dark',
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      pb: 1,
      ...sx,
    }}
  >
    {children}
  </TableCell>
);

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  rowLinkTo,
  columns: columnProp,
  paginated = false,
  loading = false,
  vertical = false,
  renderVerticalHeaderCell,
  tablePaginationProps,
  tableContainerProps,
  actionRow,
  tableProps,
  noHead = false,
  rowSx,
  headerCellSx,
  selectable,
  isRowSelectable,
  onChangeSelectedRowIds,
  EnhancedTableToolbarProps,
  filterToolbar,
  renderRow,
  noData = 'No data',
  loadingVariant = 'circular',
  condensed = false,
}: Props<T>) => {
  const columns = useMemo(
    () => (columnProp || []).filter((c) => !c.hide),
    [columnProp]
  );
  const hasHeaders = columns.find((c) => !!c.header);

  // initially undefined so we can early return and avoid state flicker
  const [selected, setSelected] = useState<string[]>();

  const selectableRowIds = useMemo(() => {
    if (!selectable) return [];
    if (!isRowSelectable) return rows.map((r) => r.id);
    return rows.filter(isRowSelectable).map((r) => r.id);
  }, [rows, selectable, isRowSelectable]);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelected(selectableRowIds);
      } else {
        setSelected([]);
      }
    },
    [selectableRowIds]
  );

  const handleSelectRow = useCallback(
    (row: T) =>
      setSelected((old) => {
        if (!old) return undefined;
        return old.includes(row.id) ? without(old, row.id) : [...old, row.id];
      }),
    []
  );

  // Clear selection when data changes
  useEffect(() => setSelected([]), [rows]);

  useEffect(() => {
    if (selected) onChangeSelectedRowIds?.(selected);
  }, [selected, onChangeSelectedRowIds]);

  // avoid state flicker due to state reset
  if (!selected) return <Loading />;

  if (loading && loadingVariant === 'circular') return <Loading />;

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

  const fullColSpan = columns.length + (selectable ? 1 : 0);
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
          {selectable && (
            <HeaderCell padding='checkbox'>
              <Checkbox
                color='primary'
                indeterminate={
                  selected.length > 0 &&
                  selected.length < selectableRowIds.length
                }
                checked={
                  selectableRowIds.length > 0 &&
                  selected.length === selectableRowIds.length
                }
                disabled={selectableRowIds.length === 0}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </HeaderCell>
          )}
          {columns.map((def, i) => (
            <HeaderCell
              key={key(def) || i}
              sx={{
                ...(headerCellSx ? headerCellSx(def) : undefined),
                textAlign: def.textAlign,
                width: def.width,
              }}
            >
              <strong>{def.header}</strong>
            </HeaderCell>
          ))}
        </TableRow>
      )}
      {loading && loadingVariant === 'linear' && (
        <TableRow>
          <TableCell colSpan={fullColSpan} sx={{ p: 0, m: 0 }}>
            <LinearProgress sx={{ height: '2px' }} />
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );

  const noResultsRow =
    rows.length > 0 ? null : (
      <TableRow>
        <TableCell
          colSpan={fullColSpan}
          sx={{
            py: 4,
            textAlign: 'center',
            // backgroundColor: (theme) =>
            //   lighten(theme.palette.background.default, 0.6),
            typography: 'body1',
          }}
        >
          {noData}
        </TableCell>
      </TableRow>
    );

  return (
    <>
      {EnhancedTableToolbarProps && (
        <EnhancedTableToolbar
          {...EnhancedTableToolbarProps}
          selectedIds={selected}
          rows={rows}
        />
      )}
      {filterToolbar}
      <TableContainer
        sx={{ height: '100%', overflow: 'auto' }}
        {...tableContainerProps}
      >
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
                    sx={{ ...verticalCellSx(1), width: '350px' }}
                    key={key(def)}
                  >
                    {' '}
                    <strong>{def.header}</strong>
                  </HeaderCell>
                  {rows.map((row, idx) => (
                    <TableCell key={row.id} sx={{ ...verticalCellSx(idx) }}>
                      {renderCellContents(row, def.render)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!vertical &&
              rows.map((row) => {
                // prop to completely take over row rendering
                if (renderRow) return renderRow(row);

                const isSelectable =
                  selectable && (isRowSelectable ? isRowSelectable(row) : true);

                let onClickHandler: undefined | ((row: T) => void) = undefined;
                if (!!handleRowClick) {
                  onClickHandler = handleRowClick;
                } else if (selectable === 'row' && isSelectable) {
                  onClickHandler = handleSelectRow;
                }

                const rowLink = (rowLinkTo && rowLinkTo(row)) || undefined;
                const isClickable = !!onClickHandler || !!rowLink;
                const firstIndexWithLinkTreatment = columns.findIndex(
                  (c) => c.linkTreatment
                );
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      ...(isClickable && clickableRowStyles),
                      ...(!!rowSx && rowSx(row)),
                    }}
                    hover={isClickable}
                    onClick={() =>
                      onClickHandler ? onClickHandler(row) : undefined
                    }
                    selected={
                      selectable === 'row' && includes(selected, row.id)
                    }
                    onKeyUp={
                      !!handleRowClick
                        ? (event) =>
                            event.key === 'Enter' && handleRowClick(row)
                        : undefined
                    }
                    tabIndex={handleRowClick ? 0 : undefined}
                  >
                    {selectable && (
                      <TableCell padding='checkbox' key='selection'>
                        <Checkbox
                          color='primary'
                          disabled={!isSelectable}
                          checked={includes(selected, row.id)}
                          inputProps={{ 'aria-label': `Select ${row.id} ` }}
                          onClick={
                            selectable === 'checkbox' && isSelectable
                              ? () => handleSelectRow(row)
                              : undefined
                          }
                        />
                      </TableCell>
                    )}
                    {columns.map((def, index) => {
                      const {
                        render,
                        width,
                        minWidth,
                        linkTreatment,
                        ariaLabel,
                        dontLink = false,
                        textAlign,
                        tableCellProps,
                      } = def;

                      const isLinked = rowLink && !dontLink;

                      const enableTabIndex =
                        firstIndexWithLinkTreatment === index ||
                        // if none have link treatment, we still need tab index. default to first col.
                        (isLinked &&
                          firstIndexWithLinkTreatment === -1 &&
                          index === 0);

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
                          {...tableCellProps}
                          sx={{
                            width,
                            minWidth,
                            ...(isLinked ? { p: 0 } : undefined),
                            textAlign,
                            whiteSpace: 'initial',
                            ...onClickLinkTreatment,
                            ...tableCellProps?.sx,
                          }}
                        >
                          {isLinked ? (
                            <RouterLink
                              to={rowLink}
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
                              tabIndex={enableTabIndex ? 0 : '-1'}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  height: '100%',
                                  alignItems: 'center',
                                  px: 2,
                                  py: condensed ? 1 : 2,
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
                );
              })}
            {actionRow}
            {/* dont show "no data" row if there is an action row, which may be for adding new elements or making another selection (MCI uses it) */}
            {!actionRow && noResultsRow}
          </TableBody>
          {paginated && tablePaginationProps && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  SelectProps={{
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  }}
                  sx={{ borderBottom: 'none' }}
                  colSpan={fullColSpan}
                  {...tablePaginationProps}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </>
  );
};

export default GenericTable;
