import {
  lighten,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { GroupItemComponentProps } from '../DynamicGroup';

import { ItemType } from '@/types/gqlTypes';

const DisabilityTable = ({
  item,
  renderChildItem,
}: GroupItemComponentProps) => (
  <Table sx={{ border: (theme) => `1px solid ${theme.palette.grey[200]}` }}>
    <TableHead>
      <TableRow>
        <TableCell></TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Disabling Condition</TableCell>
      </TableRow>
    </TableHead>
    <TableBody
      sx={{
        // Highlight last row
        '.MuiTableRow-root:last-child': {
          backgroundColor: (theme) => lighten(theme.palette.info.light, 0.9),
          td: {
            py: 2,
          },
        },
      }}
    >
      {item.item &&
        item.item.map((rowItem, index) => {
          if (!rowItem.item || rowItem.type !== ItemType.Group) {
            console.warn(
              'Incorrectly formed JSON for DisabilityTable. Children must be groups.'
            );
            return null;
          }
          return (
            <TableRow
              key={rowItem.linkId}
              sx={{
                backgroundColor: (theme) =>
                  index & 1 ? undefined : theme.palette.grey[50],
              }}
            >
              <TableCell sx={{ width: '250px', py: 3 }}>
                <Typography variant='body2' fontWeight={600}>
                  {rowItem.text}
                </Typography>
                {rowItem.helperText && (
                  <Typography variant='body2'>{rowItem.helperText}</Typography>
                )}
              </TableCell>
              {rowItem.item.map((cellItem, idx) => (
                <TableCell
                  key={cellItem.linkId}
                  sx={{
                    minWidth: '220px',
                    maxWidth: '250px',
                  }}
                >
                  {renderChildItem(cellItem, {
                    inputProps: {
                      label: null,
                      placeholder:
                        idx === 0
                          ? 'Select status...'
                          : 'Select disabling condition...',
                    },
                  })}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
    </TableBody>
  </Table>
);

export default DisabilityTable;
