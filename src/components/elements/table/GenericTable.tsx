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
import { compact, get, includes, isNil } from 'lodash-es';
import { ComponentType, ReactNode, SyntheticEvent, useMemo } from 'react';
import { To } from 'react-router-dom';

import Loading from '../Loading';

import EnhancedTableToolbar, {
  EnhancedTableToolbarProps,
} from './EnhancedTableToolbar';
import {
  ColumnDef,
  isPrimitive,
  isRenderFunction,
  RenderFunction,
} from './types';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import RouterLink from '@/components/elements/RouterLink';
import { useTableSelection } from '@/components/elements/table/hooks/useTableSelection';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { customVisuallyHidden } from '@/config/theme';
import { LocationState } from '@/routes/routeUtil';

export interface Props<T> {
  rows: T[];
  handleRowClick?: (row: T) => void;
  rowLinkTo?: (row: T) => To | null | undefined;
  rowLinkState?: LocationState;
  rowName?: (row: T) => string; // e.g. "Client X's Intake Assessment at Project Y"
  rowActionTitle?: string; // e.g. "View Assessment"
  rowSecondaryActionConfigs?: (row: T) => CommonMenuItem[];
  // hideMenu is either a boolean, which hides the actions menu for the whole table;
  // or a function returning a boolean, which indicates that only some rows should have an action menu.
  hideMenu?: boolean | ((row: T) => boolean);
  rowActionDisabled?: boolean;
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
  selectable?: 'row' | 'checkbox'; // selectable by clicking row or by clicking checkbox
  selected?: readonly string[]; // selection can optionally be controlled by the parent
  isRowSelectable?: (row: T) => boolean;
  onChangeSelectedRowIds?: (ids: readonly string[]) => void; // Used BOTH by parents that control selection, AND those with uncontrolled selection to know what rows are currently selected
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
  TableComponent?: ComponentType | keyof JSX.IntrinsicElements;
  belowRowsContent?: ReactNode; // component to insert below all rendered rows, above footer
}

export const stickyCellClassName = 'StickyTableCell';

// primary.100 on top of paper bg, so we don't layer semi-transparent primary.100 twice
const nonTransparentPrimary100bg = (theme: Theme) =>
  `linear-gradient(${theme.palette.primary[100]}, ${theme.palette.primary[100]}),${theme.palette.background.paper};`;

export const clickableRowStyles = {
  '&.Mui-selected': {
    [`.${stickyCellClassName}`]: { background: nonTransparentPrimary100bg },
  },
  '&:hover': {
    backgroundColor: 'primary.100',
    [`.${stickyCellClassName}`]: { background: nonTransparentPrimary100bg },
  },

  cursor: 'pointer',
};

const stopClickPropagation = (event: SyntheticEvent) => event.stopPropagation();

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
    <Box sx={customVisuallyHidden}>{def.key}</Box>
  );
};

/*
 * When a row is linked (`rowLinkTo` is defined), we render an `<a>` inside every cell, so the whole row is clickable.
 * This is factored out here in order to be reused by tables that use renderRow, such as the ProjectHouseholdsTable.
 */
type RenderLinkedRowCellContentsParams<T> = {
  rowLink: To;
  row: T;
  render: ColumnDef<T>['render'];
  rowLinkState?: LocationState;
  tabbable?: boolean; // whether cell should be tabbable (usually first cell in row if there is no row action menu)
};
export const renderLinkedRowCellContents = <T extends { id: string }>({
  rowLink,
  row,
  render,
  rowLinkState = undefined,
  tabbable = false,
}: RenderLinkedRowCellContentsParams<T>) => {
  // Rendering <a> inside every cell degrades tab-navigation and screen-reader UX.
  // So, we normally *also* put the row link as an action in the TableRowActions menu,
  // and then make each cell link non-tabbable and hidden from screenreaders.
  // HOWEVER, for some tables that don't have a TableRowActions menu, we make at least one cell
  // in the row (usually the first one) tabbable and accessible.
  const isInaccessibleLink = !tabbable;

  const cellContents = (
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
  );

  return (
    <>
      {/* Render contents inside an `a` tag, to ensure each cell is clickable. */}
      <RouterLink
        to={rowLink}
        state={rowLinkState}
        plain
        // Make cells non-tabbable, to enable tabbing through the table quickly,
        // UNLESS tabbable is explicitly specified (usually for the first cell in row if there is no row action menu).
        tabIndex={tabbable ? undefined : -1}
        // For isInaccessibleLink cells (non-tabbable), use aria-hidden to hide the link element.
        // Contents are rendered alongside as visually-hidden, so the screenreader still reads them (see below)
        aria-hidden={isInaccessibleLink}
        sx={{
          height: '100%',
          verticalAlign: 'middle',
          display: 'block',
          // Offset the focus outline so it doesn't overlap the border
          '&.Mui-focusVisible': { outlineOffset: '-2px' },
        }}
      >
        {cellContents}
      </RouterLink>
      {/* If the RouterLink was aria-hidden, render the contents as visually hidden alongside */}
      {isInaccessibleLink && (
        <Box sx={customVisuallyHidden}>{cellContents}</Box>
      )}
    </>
  );
};

const GenericTable = <T extends { id: string }>({
  rows,
  handleRowClick,
  rowLinkTo,
  rowLinkState,
  rowName,
  rowActionTitle,
  rowSecondaryActionConfigs,
  hideMenu,
  rowActionDisabled,
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

  const { selected, selectableRowIds, handleSelectAllClick, handleSelectRow } =
    useTableSelection({
      selectable: !!selectable,
      isRowSelectable,
      rows,
      selectedControlled: selectedProp,
      onChangeSelected: onChangeSelectedRowIds,
    });

  // avoid state flicker due to state reset
  if (!selected) return <Loading />;

  if (loading && loadingVariant === 'circular') return <Loading />;

  const verticalCellSx = (idx: number): SxProps<Theme> => ({
    border: (theme: Theme) => `1px solid ${theme.palette.grey[200]}`,
    backgroundColor: (theme: Theme) =>
      idx & 1 ? undefined : theme.palette.background.default,
  });

  // The "table row actions" column is rendered by default if there are ANY row-click actions, unless explicitly hidden by `hideMenu`.
  // If `hideMenu` is a function, we infer the menu is only hidden for certain rows, so the action col is still rendered.
  const hasTableRowActions =
    (!!rowLinkTo || !!handleRowClick || !!rowSecondaryActionConfigs) &&
    !(typeof hideMenu === 'boolean' && hideMenu);

  const fullColSpan =
    columns.length + (selectable ? 1 : 0) + (hasTableRowActions ? 1 : 0);
  const tableHead = noHead ? null : vertical ? (
    <TableHead sx={{ '.MuiTableCell-head': { verticalAlign: 'bottom' } }}>
      {renderVerticalHeaderCell && (
        <TableRow>
          <TableCell
            key='empty'
            sx={{ ...verticalCellSx(0), backgroundColor: 'background.paper' }}
          >
            <Box sx={customVisuallyHidden}>{verticalHiddenHeader}</Box>
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
              className={stickyCellClassName}
              sx={getStickyCellStyles({ sticky: 'left', stickyBorder: false })}
            >
              <Checkbox
                color='primary'
                indeterminate={
                  selected.length > 0 &&
                  selected.length < selectableRowIds.length
                }
                checked={
                  selectableRowIds.length > 0 &&
                  // >= instead of === accommodates rows that are selected but disabled
                  selected.length >= selectableRowIds.length
                }
                disabled={selectableRowIds.length === 0}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </HeaderCell>
          )}
          {columns.map((def) => {
            return (
              <HeaderCell
                key={def.key}
                className={def.sticky ? stickyCellClassName : undefined}
                sx={{
                  ...getStickyCellStyles({
                    sticky: def.sticky,
                    // The select (checkbox) col is always sticky, so add additional sticky offset here if it is present
                    leftOffset: selectable ? '46px' : 0,
                  }),
                  textAlign: def.textAlign,
                  width: def.width,
                }}
                {...def.headerCellProps}
              >
                {renderHeaderCellContents(def)}
              </HeaderCell>
            );
          })}
          {/* right-most column for row actions */}
          {hasTableRowActions && (
            <HeaderCell
              className={stickyCellClassName}
              sx={{ ...getStickyCellStyles({ sticky: 'right' }) }}
            >
              <Box sx={customVisuallyHidden}>Action</Box>
            </HeaderCell>
          )}
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
          <TableBodyComponent>
            {vertical &&
              columns.map((def) => (
                <TableRow key={def.key}>
                  <HeaderCell
                    sx={{ ...verticalCellSx(1), width: '350px' }}
                    key={def.key}
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

                const recordName = rowName?.(row) || row.id;
                const hideRowMenu =
                  typeof hideMenu === 'function' ? hideMenu(row) : hideMenu;

                const tableRowActions = hasTableRowActions && !hideRowMenu && (
                  <TableRowActions
                    record={row}
                    recordName={recordName}
                    menuActionConfigs={[
                      // first action in the menu is the row link or handleRowClick, if defined, for accessibility
                      ...(rowLink || handleRowClick
                        ? [
                            {
                              title: rowActionTitle,
                              ariaLabel: `${rowActionTitle}, ${recordName}`,
                              to: rowLink,
                              onClick: () => handleRowClick?.(row),
                              key: 'primary',
                              disabled: rowActionDisabled,
                              linkState: rowLinkState,
                            },
                          ]
                        : []),
                      ...(rowSecondaryActionConfigs?.(row) || []),
                    ]}
                  />
                );

                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      ...(isClickable && clickableRowStyles),
                      ...(!!rowSx && rowSx(row)),
                    }}
                    onClick={() =>
                      onClickHandler ? onClickHandler(row) : undefined
                    }
                    selected={
                      selectable === 'row' && includes(selected, row.id)
                    }
                  >
                    {selectable && (
                      <TableCell
                        padding='checkbox'
                        key='selection'
                        className={stickyCellClassName}
                        sx={getStickyCellStyles({
                          sticky: 'left',
                          stickyBorder: false,
                        })}
                        onClick={stopClickPropagation}
                      >
                        <Checkbox
                          color='primary'
                          disabled={!isSelectable}
                          checked={includes(selected, row.id)}
                          inputProps={{
                            'aria-label': `Select ${recordName}`,
                          }}
                          onClick={
                            isSelectable
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
                        maxWidth,
                        dontLink = false,
                        textAlign,
                        tableCellProps,
                        sticky,
                      } = def;

                      const isLinked = rowLink && !dontLink;

                      const cellProps =
                        typeof tableCellProps === 'function'
                          ? tableCellProps(row)
                          : tableCellProps;

                      return (
                        <TableCell
                          key={def.key}
                          {...cellProps}
                          className={sticky ? stickyCellClassName : undefined}
                          sx={{
                            ...getStickyCellStyles({
                              sticky,
                              leftOffset: selectable ? '46px' : 0,
                            }),
                            width,
                            minWidth,
                            // don't override maxWidth from sticky styles if it is undefined on column def
                            ...(maxWidth ? { maxWidth: maxWidth } : undefined),
                            ...(isLinked ? { p: 0 } : undefined),
                            textAlign,
                            whiteSpace: 'initial',
                            ...cellProps?.sx,
                          }}
                          role={sticky === 'left' ? 'rowheader' : undefined}
                          // Reuse `dontLink` to prevent click propagation if the row has a click handler, but the cell has a more specific click target
                          onClick={dontLink ? stopClickPropagation : undefined}
                        >
                          {isLinked
                            ? renderLinkedRowCellContents({
                                rowLink,
                                row,
                                render,
                                rowLinkState,
                                tabbable: index === 0 && !tableRowActions,
                              })
                            : renderCellContents(row, render)}
                        </TableCell>
                      );
                    })}
                    {tableRowActions && (
                      <TableCell
                        className={stickyCellClassName}
                        sx={{
                          ...getStickyCellStyles({ sticky: 'right' }),
                          width: '1%',
                          py: 0,
                          px: 1,
                          whiteSpace: 'nowrap',
                        }}
                        onClick={stopClickPropagation}
                      >
                        {tableRowActions}
                      </TableCell>
                    )}
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
