import {
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { cloneDeep } from 'lodash-es';

import { useId, useMemo } from 'react';
import { GroupItemComponentProps } from '../../types';
import RequiredLabel from '../RequiredLabel';
import { ItemType } from '@/types/gqlTypes';

/**
 * Dynamically renders children in a table. See expected format below.
 *
 * The TableHeader labels and helper text will be pulled from the labels defined
 * on the items in the first "row group".
 *
 * Text and helperText are ignored for subsequent row items.
 *
 * {
 *   "type": "GROUP",
 *   "component": "TABLE",
 *   "item": [
 *      {
 *        "type": "GROUP", // represents first row
 *        "item": [
 *            // row 1 col 1 input
 *            // row 1 col 2 input
 *            // row 1 col 3 input
 *        ]
 *      },
 *      {
 *        "type": "GROUP", // represents second row
 *        "item": [
 *            // row 2 col 1 input
 *            // row 2 col 2 input
 *            // row 2 col 3 input
 *        ]
 *      }
 *    ]
 * }
 */
const TableGroup = ({
  item,
  renderChildItem,
  viewOnly = false,
}: GroupItemComponentProps) => {
  const label = viewOnly ? item.readonlyText || item.text : item.text;
  const baseId = useId();

  // Determine header row details by looking at the first row of Items
  const tableHeaderInfo = useMemo(() => {
    if (
      !item.item ||
      item.item[0].type !== ItemType.Group ||
      !item.item[0].item
    ) {
      throw new Error(`Invalid table format for item ${item.linkId}`);
    }

    return item.item[0].item.map(
      ({ linkId, text, helperText, readonlyText, required }) => ({
        id: baseId + linkId,
        label: viewOnly ? readonlyText || text : text,
        helperText,
        required,
      })
    );
  }, [item, viewOnly, baseId]);

  // Memoize the props configuration for each cell to maintain stable references
  const cellConfigs = useMemo(() => {
    return tableHeaderInfo.map((header) => ({
      // hide label for each input, since they are labeled by the header
      noLabel: true,
      inputProps: { ariaLabelledBy: header.id },
    }));
  }, [tableHeaderInfo]);

  // Create a stable memoized representation of the table row items, with cell helper text removed
  const rowItems = useMemo(() => {
    if (!item.item) return null;

    const rowItemsClone = cloneDeep(item.item);
    // remove helper text from Cell Items, because it's shown in table header
    rowItemsClone.forEach((rowItem) =>
      rowItem.item?.forEach((cellItem) => (cellItem.helperText = null))
    );
    return rowItemsClone;
  }, [item.item]);

  // Create a stable memoized representation of the table rows
  const tableRows = useMemo(() => {
    if (!rowItems) return null;

    return rowItems.map((rowItem) => (
      <TableRow key={rowItem.linkId}>
        {rowItem.item?.map((cellItem, index) => (
          <TableCell key={cellItem.linkId}>
            {renderChildItem(cellItem, cellConfigs[index])}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [rowItems, renderChildItem, cellConfigs]);

  return (
    <Grid item xs>
      {(label || item.helperText) && (
        <Stack sx={{ mb: 2 }} gap={1}>
          {label && <Typography>{label}</Typography>}
          {item.helperText && (
            <Typography variant='body2' component='span'>
              {item.helperText}
            </Typography>
          )}
        </Stack>
      )}
      <Table
        size='small' // less padding in table cells
        sx={{
          border: (theme) => `1px solid ${theme.palette.grey[200]}`,
          p: 1,
          '.MuiTableCell-root': {
            borderRightColor: 'borders.light',
            borderRightWidth: 1,
            borderRightStyle: 'solid',
          },
        }}
        aria-label={label || undefined}
      >
        <TableHead>
          <TableRow>
            {tableHeaderInfo.map(({ id, label, required, helperText }) => (
              <TableCell
                id={id}
                key={id}
                sx={{
                  borderBottomColor: 'borders.dark',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  py: 1,
                }}
              >
                {label && (
                  <RequiredLabel
                    text={label}
                    TypographyProps={{ fontWeight: 'bold' }}
                    required={required}
                  />
                )}
                {helperText && (
                  <Typography
                    variant='caption'
                    component='span'
                    display='block'
                  >
                    {helperText}
                  </Typography>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </Grid>
  );
};

export default TableGroup;
