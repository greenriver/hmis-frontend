import {
  Grid,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useMemo } from 'react';
import { GroupItemComponentProps } from '../../types';
import RequiredLabel from '../RequiredLabel';
import { ItemType } from '@/types/gqlTypes';

/**
 * Dynamically renders children in a table. See expected format below.
 *
 * The TableHeader labels and helper text will be pulled from the labels defined
 * on the items in the first "row group".
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

  // Determine header row details by looking at the first row of Items
  const tableHeaderInfo = useMemo(() => {
    if (
      !item.item ||
      item.item[0].type !== ItemType.Group ||
      !item.item[0].item
    ) {
      throw new Error(`invalid table format form item ${item.linkId}`);
    }

    return item.item[0].item.map(
      ({ linkId, text, helperText, readonlyText, required }) => ({
        id: `${linkId}-id`,
        label: viewOnly ? readonlyText || text : text,
        helperText,
        required,
      })
    );
  }, [item, viewOnly]);

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
          width: 'initial',
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
        {item.item?.map((rowItem) => (
          <TableRow key={rowItem.linkId}>
            {rowItem.item?.map((cellItem, index) => (
              <TableCell key={cellItem.linkId}>
                {renderChildItem(
                  // remove helper text, it is shown in table header
                  { ...cellItem, helperText: null },
                  // hide label for each input, since they are labeled by the header
                  {
                    noLabel: true,
                    inputProps: { ariaLabelledBy: tableHeaderInfo[index].id },
                  }
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </Table>
    </Grid>
  );
};

export default TableGroup;
