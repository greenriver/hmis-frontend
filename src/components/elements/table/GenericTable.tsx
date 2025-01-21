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
import { SystemStyleObject } from '@mui/system';
import { visuallyHidden } from '@mui/utils';
import { compact, get, includes, isNil, without } from 'lodash-es';
import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  verticalHiddenHeader?: string; // For vertically oriented tables, this is the hidden header of the first column
  noHead?: boolean;
  renderVerticalHeaderCell?: RenderFunction<T>;
  rowSx?: (row: T) => SxProps<Theme>;
  headerCellSx?: (def: ColumnDef<T>) => SxProps<Theme>;
  selectable?: 'row' | 'checkbox'; // selectable by clicking row or by clicking checkbox
  selected?: readonly string[]; // can optionally be used as a controlled component
  isRowSelectable?: (row: T) => boolean;
  onChangeSelectedRowIds?: (ids: readonly string[]) => void;
  EnhancedTableToolbarProps?: Omit<
    EnhancedTableToolbarProps<T>,
    'selectedIds' | 'rows'
  >;
  filterToolbar?: ReactNode;
  noData?: ReactNode;
  // columnKeys contains the keys of columns currently rendered, so renderRow knows about which optional columns are shown/hidden.
  renderRow?: (row: T, columnKeys: string[]) => ReactNode;
  // TableBodyComponent can be overridden. This should only be used by tables that take over rendering using renderRow and render a `tbody` within their custom render fn
  TableBodyComponent?: ComponentType | keyof JSX.IntrinsicElements;
  belowRowsContent?: ReactNode; // component to insert below all rendered rows, above footer
}

const clickableRowStyles = {
  '&:focus': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
  cursor: 'pointer',
};
export const getStickyCellStyles = ({
  sticky,
  stickyBorder = true,
  leftOffset = 0,
  rightOffset = 0,
}: {
  sticky?: 'left' | 'right';
  stickyBorder?: boolean;
  leftOffset?: string | number;
  rightOffset?: string | number;
}): SystemStyleObject<Theme> => {
  if (!sticky) return {};

  const base = {
    backgroundColor: 'background.paper', // Otherwise it's transparent and other cell content appears beneath it
    position: 'sticky',
    zIndex: 1,
    maxWidth: '200px', // Mitigates the risk that the column may be so wide as to obscure any scrollable columns
    overflow: 'clip',
  };

  // Pseudo-element to achieve a border on sticky cells. `position: sticky` doesn't work with regular border
  const pseudo = stickyBorder
    ? {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: 'borders.light',
        pointerEvents: 'none', // Don't interfere with interactions
      }
    : {};

  if (sticky === 'right')
    return {
      ...base,
      right: rightOffset,
      '&::before': {
        ...pseudo,
        left: 0,
      },
    };

  return {
    ...base,
    left: leftOffset,
    '&::after': {
      ...pseudo,
      right: 0,
    },
  };
};

const HeaderCell = ({ children, sx, ...rest }: TableCellProps) => (
  <TableCell
    sx={{
      borderBottomColor: 'borders.dark',
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      pb: 1,
      ...sx,
    }}
    {...rest}
  >
    {children}
  </TableCell>
);

export const renderCellContents = <T extends { id: string }>(
  row: T,
  render: ColumnDef<T>['render']
) => {
  if (isRenderFunction<T>(render)) return <>{render(row)}</>;
  if (isPrimitive<T>(render)) {
    const val = get(row, render);
    if (!isNil(val)) return <>{`${val}`}</>;
  }
  return null;
};

export const renderHeaderCellContents = <T extends { id: string }>(
  def: ColumnDef<T>
) => {
  return def.header ? (
    <strong>{def.header}</strong>
  ) : (
    // If header isn't provided, add a visually hidden header with the column key for accessibility
    <Box sx={visuallyHidden}>{def.key}</Box>
  );
};

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  rowLinkTo,
  columns: columnProp,
  paginated = false,
  loading = false,
  vertical = false,
  verticalHiddenHeader,
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
  selected: selectedProp,
  onChangeSelectedRowIds,
  EnhancedTableToolbarProps,
  filterToolbar,
  renderRow,
  noData = 'No data',
  loadingVariant = 'circular',
  TableBodyComponent = TableBody,
  belowRowsContent,
}: Props<T>) => {
  const columns = useMemo(
    () => (columnProp || []).filter((c) => !c.hide),
    [columnProp]
  );
  const hasHeaders = columns.find((c) => !!c.header);

  // initially undefined so we can early return and avoid state flicker
  const [selected, setSelected] = useState<string[]>();
  const isSelectControlled = selectedProp !== undefined;
  const selectedValue = useMemo(
    () => (isSelectControlled ? selectedProp : selected || []),
    [isSelectControlled, selected, selectedProp]
  );

  const selectableRowIds = useMemo(() => {
    if (!selectable) return [];
    if (!isRowSelectable) return rows.map((r) => r.id);
    return rows.filter(isRowSelectable).map((r) => r.id);
  }, [rows, selectable, isRowSelectable]);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        if (!isSelectControlled) {
          setSelected(selectableRowIds);
        }

        onChangeSelectedRowIds?.(selectableRowIds);
      } else {
        if (!isSelectControlled) {
          setSelected([]);
        }

        onChangeSelectedRowIds?.([]);
      }
    },
    [isSelectControlled, onChangeSelectedRowIds, selectableRowIds]
  );

  const handleSelectRow = useCallback(
    (row: T) => {
      const newValue = selectedValue.includes(row.id)
        ? without(selectedValue, row.id)
        : [...selectedValue, row.id];

      if (!isSelectControlled) {
        setSelected(newValue);
      }

      onChangeSelectedRowIds?.(newValue);
    },
    [isSelectControlled, onChangeSelectedRowIds, selectedValue]
  );

  // Clear selection when data changes
  useEffect(() => setSelected([]), [rows]);

  // avoid state flicker due to state reset
  if (!selected) return <Loading />;

  if (loading && loadingVariant === 'circular') return <Loading />;

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
          <TableCell
            key='empty'
            sx={{ ...verticalCellSx(0), backgroundColor: 'background.paper' }}
          >
            <Box sx={visuallyHidden}>{verticalHiddenHeader}</Box>
          </TableCell>
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
            <HeaderCell
              padding='checkbox'
              sx={getStickyCellStyles({ sticky: 'left', stickyBorder: false })}
            >
              <Checkbox
                color='primary'
                indeterminate={
                  selectedValue.length > 0 &&
                  selectedValue.length < selectableRowIds.length
                }
                checked={
                  selectableRowIds.length > 0 &&
                  // >= instead of === accommodates rows that are selected but disabled
                  selectedValue.length >= selectableRowIds.length
                }
                disabled={selectableRowIds.length === 0}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </HeaderCell>
          )}
          {columns.map((def, i) => {
            const headerStyles = headerCellSx ? headerCellSx(def) : {};
            return (
              <HeaderCell
                key={key(def) || i}
                sx={{
                  ...getStickyCellStyles({
                    sticky: def.sticky,
                    leftOffset: selectable ? '46px' : 0,
                  }),
                  textAlign: def.textAlign,
                  width: def.width,
                  // headerStyles has SxProps type so we can't spread it directly. https://mui.com/system/getting-started/the-sx-prop/#passing-the-sx-prop
                  ...(Array.isArray(headerStyles)
                    ? headerStyles
                    : [headerStyles]),
                }}
                {...def.headerCellProps}
              >
                {renderHeaderCellContents(def)}
              </HeaderCell>
            );
          })}
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
          selectedIds={selectedValue}
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
          <TableBodyComponent>
            {vertical &&
              columns.map((def, i) => (
                <TableRow key={key(def) || i}>
                  <HeaderCell
                    sx={{ ...verticalCellSx(1), width: '350px' }}
                    key={key(def)}
                    role='rowheader'
                    {...def.headerCellProps}
                  >
                    {renderHeaderCellContents(def)}
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
                if (renderRow) {
                  return renderRow(row, compact(columns.map((c) => c.key)));
                }

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
                      selectable === 'row' && includes(selectedValue, row.id)
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
                      <TableCell
                        padding='checkbox'
                        key='selection'
                        sx={getStickyCellStyles({
                          sticky: 'left',
                          stickyBorder: false,
                        })}
                      >
                        <Checkbox
                          color='primary'
                          disabled={!isSelectable}
                          checked={includes(selectedValue, row.id)}
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

                      const cellProps =
                        typeof tableCellProps === 'function'
                          ? tableCellProps(row)
                          : tableCellProps;

                      return (
                        <TableCell
                          key={key(def) || index}
                          {...cellProps}
                          sx={{
                            ...getStickyCellStyles({
                              sticky: def.sticky,
                              leftOffset: selectable ? '46px' : 0,
                            }),
                            width,
                            minWidth,
                            ...(isLinked ? { p: 0 } : undefined),
                            textAlign,
                            whiteSpace: 'initial',
                            ...onClickLinkTreatment,
                            ...cellProps?.sx,
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
                              tabIndex={enableTabIndex ? 0 : -1}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  height: '100%',
                                  alignItems: 'center',
                                  px: 2,
                                  py: 2,
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
            {belowRowsContent}
            {actionRow}
            {/* dont show "no data" row if there is an action row, which may be for adding new elements or making another selection (MCI uses it) */}
            {!actionRow && noResultsRow}
          </TableBodyComponent>
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
