import { Box, Grid, Typography } from '@mui/material';
import { isBoolean, isNumber, pick, reduce } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { GroupItemComponentProps } from '../DynamicGroup';

import NumberInput from '@/components/elements/input/NumberInput';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormItem,
  ItemType,
  NoYesReasonsForMissingData,
} from '@/types/gqlTypes';

const InputGroupWithSummary = ({
  item,
  values,
  renderChildItem,
  itemChanged,
}: GroupItemComponentProps) => {
  const childItemLinkIds: string[] = useMemo(
    () => item.item?.map((item) => item.linkId) || [],
    [item]
  );

  const [summaryChild, dynamicChildren]: [FormItem | null, FormItem[]] =
    useMemo(() => {
      if (!item.item) return [null, []];
      if (
        item.item[0].type === ItemType.Choice &&
        item.item[0].pickListReference === 'NoYesReasonsForMissingData'
      ) {
        const [first, ...rest] = item.item;
        return [first, rest];
      }
      return [null, item.item];
    }, [item]);

  const childItemType = useMemo(
    () => (item.item ? item.item[1].type : undefined),
    [item]
  );
  const hideDynamicChildren = useMemo(
    () =>
      summaryChild &&
      values[summaryChild.linkId] &&
      values[summaryChild.linkId].code !== NoYesReasonsForMissingData.Yes,
    [summaryChild, values]
  );

  const wrappedChildren = useMemo(() => {
    if (hideDynamicChildren) return null;
    return (
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        columnSpacing={0}
        sx={{ '& .MuiGrid-item': { pt: 0 }, mt: 3 }}
      >
        {renderChildItem &&
          dynamicChildren.map((childItem) => renderChildItem(childItem))}
      </Grid>
    );
  }, [renderChildItem, dynamicChildren, hideDynamicChildren]);

  // Sum of child numeric inputs (if applicable)
  const sum = useMemo(() => {
    if (!childItemType) return;
    if (![ItemType.Currency, ItemType.Integer].includes(childItemType)) return;
    const relevant = pick(values, childItemLinkIds);
    return reduce(
      relevant,
      (sum, value) => {
        const val = parseInt(value);
        return isNumber(val) && !isNaN(val) ? sum + val : sum;
      },
      0
    );
  }, [values, childItemLinkIds, childItemType]);

  // Whether any of the child checkboxes are checked (if applicable)
  const anyTrue = useMemo(() => {
    if (!childItemType) return false;
    if (childItemType !== ItemType.Boolean) return false;
    const relevant = pick(values, childItemLinkIds);
    return Object.values(relevant)
      .filter((v) => isBoolean(v))
      .some(Boolean);
  }, [values, childItemLinkIds, childItemType]);

  // Update the value of the NoYesReasonsForMissingData summary child
  useEffect(() => {
    if (!summaryChild) return;
    if ((sum && sum > 0) || anyTrue) {
      itemChanged(summaryChild.linkId, {
        code: NoYesReasonsForMissingData.Yes,
        label: HmisEnums.NoYesReasonsForMissingData.YES,
      });
    }
  }, [sum, itemChanged, summaryChild, anyTrue]);

  return (
    <Box sx={{ py: 3 }}>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {summaryChild && renderChildItem && (
        <Grid container direction={'column'} rowSpacing={2} columnSpacing={0}>
          {renderChildItem(summaryChild)}
        </Grid>
      )}
      {wrappedChildren}
      {!hideDynamicChildren &&
        dynamicChildren &&
        dynamicChildren[0].type === ItemType.Currency && (
          <Box sx={{ mt: 3 }}>
            <NumberInput
              horizontal
              value={sum || 0}
              disabled
              label='Monthly Total Income'
              currency={childItemType === ItemType.Currency}
            />
          </Box>
        )}
    </Box>
  );
};

export default InputGroupWithSummary;
