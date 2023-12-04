import {
  lighten,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useId, useCallback, useEffect, useMemo } from 'react';

import {
  ChangeType,
  GroupItemComponentProps,
  isPickListOption,
  ItemChangedFn,
} from '../../types';

import { yesCode } from '../../util/formUtil';
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
    return item.item.slice(-1)[0].item.find((i) => i.type === ItemType.Choice)
      ?.linkId;
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

  // Set DisablingCondition initially to YES if applicable.
  useEffect(() => {
    if (!itemChanged || !disablingConditionLinkId) return;
    if (dependentsThatAreYes.length > 0) {
      itemChanged({
        linkId: disablingConditionLinkId,
        value: yesCode,
        type: ChangeType.System,
      });
    }

    // DANGER: this doesn't need to run each time values change, just on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disablingConditionLinkId, itemChanged]);

  // Override itemChanged for dependents.
  const handleItemChanged: ItemChangedFn = useCallback(
    ({ linkId, value, type }) => {
      if (!itemChanged || !severalItemsChanged || !disablingConditionLinkId)
        return;

      const modifiesOverallDisablingCondition =
        dependentLinkIds.indexOf(linkId) !== -1;

      if (!modifiesOverallDisablingCondition) {
        return itemChanged({ linkId, value, type });
      }

      const wasOnlyRemainingYes =
        dependentsThatAreYes.length === 1 && dependentsThatAreYes[0] === linkId;

      // If the dependent is Yes, also update DisablingCondition to be Yes.

      const isChangedToYes =
        value && isPickListOption(value) && value.code === 'YES';
      if (isChangedToYes) {
        // Make "DisablingCondition" be yes, because this dependent is yes
        severalItemsChanged({
          values: { [linkId]: value, [disablingConditionLinkId]: yesCode },
          type,
        });
      } else if (wasOnlyRemainingYes) {
        // This was the last remaining "yes" that was forcing DisablingCondition to be yes.
        // So, we set DisablingCondition to NULL, so the user has to input a value.
        severalItemsChanged({
          values: { [linkId]: value, [disablingConditionLinkId]: null },
          type,
        });
      } else {
        itemChanged({ linkId, value, type });
      }
    },
    [
      itemChanged,
      severalItemsChanged,
      disablingConditionLinkId,
      dependentLinkIds,
      dependentsThatAreYes,
    ]
  );

  // IDs for accessibility labels
  const statusId = useId();
  const disablingConditionId = useId();
  const disabilityTypeId = useId();

  return (
    <Table
      sx={{ border: (theme) => `1px solid ${theme.palette.grey[200]}`, mb: 2 }}
    >
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell id={statusId}>Status</TableCell>
          <TableCell id={disablingConditionId}>Disabling Condition</TableCell>
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
                <TableCell sx={{ width: '250px', py: 3 }} id={disabilityTypeId}>
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
                      pr: 2,
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
                        // Reads as "Physical Disability Status" or "Physical Disability Disabling Condition"
                        ariaLabelledBy: `${disabilityTypeId} ${
                          idx === 0 ? statusId : disablingConditionId
                        }`,
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
