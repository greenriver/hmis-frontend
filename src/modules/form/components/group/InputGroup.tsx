import { Box, Grid, Stack, Typography } from '@mui/material';
import { isNumber, pick, reduce } from 'lodash-es';
import { useMemo } from 'react';

import { maxWidthAtNestingLevel } from '../DynamicField';
import { GroupItemComponentProps } from '../DynamicGroup';

import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { ItemType } from '@/types/gqlTypes';

const InputGroup = ({
  item,
  values,
  renderChildItem,
  nestingLevel,
}: GroupItemComponentProps) => {
  const childItemLinkIds: string[] = useMemo(
    () => item.item?.map((item) => item.linkId) || [],
    [item]
  );

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

  const wrappedChildren = useMemo(() => {
    return (
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        columnSpacing={0}
        sx={{ '& .MuiGrid-item': { pt: 0 }, mt: 3 }}
      >
        {renderChildItem &&
          item.item &&
          item.item.map((childItem, idx) => (
            <Box
              key={childItem.linkId}
              sx={{
                backgroundColor: (theme) =>
                  idx & 1 ? undefined : theme.palette.grey[100],
                pl: 1,
                pb: 0.5,
                pr: 0.5,
                maxWidth: isCurrency
                  ? maxWidthAtNestingLevel(nestingLevel + 1)
                  : undefined,
              }}
            >
              {renderChildItem(childItem, childProps)}
            </Box>
          ))}
      </Grid>
    );
  }, [renderChildItem, item, childProps, nestingLevel, isCurrency]);

  // Sum of child numeric inputs (if applicable)
  const sum = useMemo(() => {
    if (!isCurrency) return 0;
    const relevant = pick(values, childItemLinkIds);
    return reduce(
      relevant,
      (sum, value) => {
        const val = parseFloat(value);
        return isNumber(val) && !isNaN(val) ? sum + val : sum;
      },
      0
    );
  }, [values, childItemLinkIds, isCurrency]);

  return (
    <Box sx={{ py: 3 }}>
      {item.text && <Typography>{item.text}</Typography>}
      {wrappedChildren}
      {isCurrency && (
        <Stack
          justifyContent='space-between'
          direction='row'
          sx={{
            pl: 1,
            pr: 0.5,
            pt: 2,
            mt: 1,
            borderTop: (theme) => `1px solid ${theme.palette.grey[500]}`,
            maxWidth: maxWidthAtNestingLevel(nestingLevel + 1),
          }}
        >
          <Typography>Monthly Total Income</Typography>
          <Typography sx={{ width: '120px', pl: 1 }}>
            {formatCurrency(sum || 0)}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default InputGroup;
