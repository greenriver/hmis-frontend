import { Box, Grid, Typography } from '@mui/material';
import { isBoolean, isNil, isNumber, pick, reduce } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';

import { maxWidthAtNestingLevel } from '../DynamicField';
import { GroupItemComponentProps } from '../DynamicGroup';

import NumberInput from '@/components/elements/input/NumberInput';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormItem,
  ItemType,
  NoYesReasonsForMissingData,
} from '@/types/gqlTypes';

const YES_OPTION = {
  code: NoYesReasonsForMissingData.Yes,
  label: HmisEnums.NoYesReasonsForMissingData.YES,
};

const InputGroupWithSummary = ({
  item,
  values,
  renderChildItem,
  itemChanged,
  nestingLevel,
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

  const isCurrency = useMemo(
    () => childItemType === ItemType.Currency,
    [childItemType]
  );

  const childProps = useMemo(
    () => (isCurrency ? { horizontal: true } : undefined),
    [isCurrency]
  );

  const hideDynamicChildren = useMemo(
    () =>
      summaryChild &&
      values[summaryChild.linkId] &&
      values[summaryChild.linkId].code !== YES_OPTION.code,
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
          dynamicChildren.map((childItem, idx) => (
            <Box
              sx={{
                backgroundColor: (theme) =>
                  idx & 1 ? undefined : theme.palette.grey[100],
                pl: 1,
                pb: 0.5,
                pr: 0.5,
                maxWidth: maxWidthAtNestingLevel(nestingLevel + 1),
              }}
            >
              {renderChildItem(childItem, childProps)}
            </Box>
          ))}
      </Grid>
    );
  }, [
    renderChildItem,
    dynamicChildren,
    hideDynamicChildren,
    childProps,
    nestingLevel,
  ]);

  // Sum of child numeric inputs (if applicable)
  const sum = useMemo(() => {
    if (!isCurrency) return 0;
    const relevant = pick(values, childItemLinkIds);
    return reduce(
      relevant,
      (sum, value) => {
        const val = parseInt(value);
        return isNumber(val) && !isNaN(val) ? sum + val : sum;
      },
      0
    );
  }, [values, childItemLinkIds, isCurrency]);

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
  // Triggered when `sum` or `anyTrue` change
  useEffect(() => {
    if (!summaryChild) return;
    if ((sum && sum > 0) || anyTrue) {
      itemChanged(summaryChild.linkId, YES_OPTION);
    }
  }, [sum, itemChanged, summaryChild, anyTrue]);

  const summaryItemChanged = useCallback(
    (linkId: string, value: any) => {
      if (!summaryChild) return;
      if (linkId !== summaryChild.linkId) return; // should not happen

      // IGNORE CHANGE if user was unsetting "YES" and the group has value
      const isNullWithValue = isNil(value) && (sum > 0 || anyTrue);
      if (
        isNullWithValue &&
        values[linkId] &&
        values[linkId].code === NoYesReasonsForMissingData.Yes
      ) {
        return;
      }

      // INFER YES-value if user was unsetting NO/DK/R and the group has value
      if (isNullWithValue) value = YES_OPTION;

      // Pass off to parent
      itemChanged(linkId, value);
    },
    [summaryChild, sum, anyTrue, itemChanged, values]
  );

  return (
    <Box sx={{ py: 3 }}>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {summaryChild && renderChildItem && (
        <Grid container direction={'column'} rowSpacing={2} columnSpacing={0}>
          {renderChildItem(summaryChild, {
            itemChanged: summaryItemChanged,
          })}
        </Grid>
      )}
      {wrappedChildren}
      {!hideDynamicChildren && isCurrency && (
        <Box
          sx={{
            pl: 1,
            pr: 0.5,
            maxWidth: maxWidthAtNestingLevel(nestingLevel + 1),
          }}
        >
          <NumberInput
            horizontal
            value={sum || 0}
            disabled
            label='Monthly Total Income'
            currency={isCurrency}
          />
        </Box>
      )}
    </Box>
  );
};

export default InputGroupWithSummary;
