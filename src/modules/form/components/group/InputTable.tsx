import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';

import { GroupItemComponentProps } from '../DynamicGroup';

import { ItemType } from '@/types/gqlTypes';

const InputGroup = ({ item, renderChildItem }: GroupItemComponentProps) => {
  return (
    <Box sx={{ pt: 2 }} id={item.linkId}>
      {item.text && <Typography>{item.text}</Typography>}
      <Table>
        <TableBody>
          {item.item &&
            item.item.map((rowItem, index) => {
              if (!rowItem.item || rowItem.type !== ItemType.Group) {
                console.warn(
                  'Incorrectly formed JSON for InputTable. Children must be groups.'
                );
                return null;
              }
              return (
                <TableRow
                  key={rowItem.linkId}
                  sx={{
                    backgroundColor: (theme) =>
                      index & 1 ? undefined : theme.palette.grey[100],
                  }}
                >
                  <TableCell sx={{ width: '250px', py: 2.5 }}>
                    <Typography variant='body2' fontWeight={600}>
                      {rowItem.text}
                    </Typography>
                    {rowItem.helperText && (
                      <Typography variant='body2'>
                        {rowItem.helperText}
                      </Typography>
                    )}
                  </TableCell>
                  {rowItem.item.map((cellItem, idx) => (
                    <TableCell
                      key={cellItem.linkId}
                      sx={{ minWidth: '220px', maxWidth: '250px' }}
                    >
                      {renderChildItem(cellItem, {
                        inputProps: {
                          label: null,
                          ...(idx === 0
                            ? { placeholder: 'Select status...' }
                            : undefined),
                        },
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InputGroup;
