import {
  lighten,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ChangeType,
  GroupItemComponentProps,
  isPickListOption,
  ItemChangedFn,
} from '../../types';

import { FormItem, ItemType } from '@/types/gqlTypes';

interface DisabilityGroupRow extends FormItem {
  type: ItemType.Group;
  item: [FormItem, FormItem];
}
interface DisabilityGroupItem extends FormItem {
  item: [DisabilityGroupRow];
}
function isValidDisabilityGroup(item: FormItem): item is DisabilityGroupItem {
  return (
    !!item.item &&
    item.item.every(
      (child) =>
        child.type === ItemType.Group && child.item && child.item.length === 2
    )
  );
}

const DisabilityTable = ({
  values,
  item,
  renderChildItem,
  itemChanged,
  severalItemsChanged,
}: GroupItemComponentProps) => {
  // Link ID for DisablingCondition, which is the last row in the table
  const disablingConditionLinkId = useMemo(() => {
    if (!isValidDisabilityGroup(item)) return;
    return item.item.slice(-1)[0].item[0].linkId;
  }, [item]);

  // Link IDs for items that, if YES, consitute a Disabling Condition per HUD spec.
  // This is highly dependent on the structure of the item group.
  const dependentLinkIds = useMemo(() => {
    if (!isValidDisabilityGroup(item))
      throw new Error('incorrectly formatted disability table');

    return item.item
      .map((i, idx) => {
        if (idx === item.item.length - 1) return; // Skip last, which is DisablingCondition
        if (i.item[1].type === ItemType.Choice) {
          return i.item[1].linkId;
        } else {
          return i.item[0].linkId;
        }
      })
      .filter((id) => !!id);
  }, [item]);

  const dependentsThatAreYes = useMemo(
    () =>
      Object.keys(values).filter(
        (k) => dependentLinkIds.indexOf(k) !== -1 && values[k]?.code === 'YES'
      ),
    [dependentLinkIds, values]
  );

  // If all dependents are set to non-YES values, clear out DisablingCondition
  useEffect(() => {
    if (!itemChanged || !disablingConditionLinkId) return;
    if (dependentsThatAreYes.length === 0) {
      itemChanged({
        linkId: disablingConditionLinkId,
        value: null,
        type: ChangeType.System,
      });
    }
  }, [dependentsThatAreYes.length, disablingConditionLinkId, itemChanged]);

  // Override itemChanged for dependents.
  // If the dependent is Yes, also update DisablingCondition to be Yes.
  // If all the dependents are NOT Yes, update DisablingCondition to its original value (if it was previously system-generated).
  const handleItemChanged: ItemChangedFn = useCallback(
    ({ linkId, value, type }) => {
      if (!itemChanged || !severalItemsChanged || !disablingConditionLinkId)
        return;

      if (
        dependentLinkIds.indexOf(linkId) !== -1 &&
        value &&
        isPickListOption(value) &&
        value.code === 'YES'
      ) {
        const values = {
          [linkId]: value,
          [disablingConditionLinkId]: { code: 'YES' },
        };
        severalItemsChanged({ values, type });
      } else if (linkId === disablingConditionLinkId) {
        setPrev(value); //user-initiated
        itemChanged({ linkId, value, type });
      } else {
        itemChanged({ linkId, value, type });
      }
    },
    [
      itemChanged,
      severalItemsChanged,
      dependentLinkIds,
      disablingConditionLinkId,
    ]
  );

  return (
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
        {isValidDisabilityGroup(item) &&
          item.item.map((rowItem, index) => {
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
                    <Typography variant='body2'>
                      {rowItem.helperText}
                    </Typography>
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
                      noLabel: true,
                      inputProps: {
                        label: null,
                        placeholder:
                          idx === 0
                            ? 'Select Status'
                            : 'Select Disabling Condition',
                      },
                      disabled:
                        (cellItem.linkId === disablingConditionLinkId &&
                          dependentsThatAreYes.length > 0) ||
                        false,
                      itemChanged: handleItemChanged,
                    })}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};
export default DisabilityTable;
