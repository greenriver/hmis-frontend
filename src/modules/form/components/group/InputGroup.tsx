import { Box, Grid, Stack, Typography } from '@mui/material';
import { isFinite, pick, reduce } from 'lodash-es';
import { ReactNode, useCallback, useMemo } from 'react';

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

  const childRenderFunc = useCallback(
    (linkId: string, index: number) => (children: ReactNode) =>
      (
        <Box
          key={linkId}
          sx={{
            backgroundColor: (theme) =>
              index & 1 ? undefined : theme.palette.grey[100],
            pl: 1,
            pb: 0.5,
            pr: 0.5,
            maxWidth: isCurrency
              ? maxWidthAtNestingLevel(nestingLevel + 1)
              : undefined,
          }}
        >
          {children}
        </Box>
      ),
    [isCurrency, nestingLevel]
  );

  const wrappedChildren = useMemo(() => {
    return (
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        columnSpacing={0}
        sx={{ '& .MuiGrid-item': { pt: 0 }, mt: 2 }}
      >
        {renderChildItem &&
          item.item &&
          item.item
            .filter((i) => !i.hidden)
            .map((childItem, index) =>
              renderChildItem(
                childItem,
                childProps,
                // pass render function so child gets wrapped in box.
                // can't wrap here because child might be hidden, in which case we shouldn't wrap it.
                childRenderFunc(childItem.linkId, index)
              )
            )}
      </Grid>
    );
  }, [renderChildItem, item, childProps, childRenderFunc]);

  // Sum of child numeric inputs (if applicable)
  const sum = useMemo(() => {
    if (!isCurrency) return 0;
    const relevant = pick(values, childItemLinkIds);
    return reduce(
      relevant,
      (sum, value) => {
        const val = parseFloat(value);
        return isFinite(val) ? sum + val : sum;
      },
      0
    );
  }, [values, childItemLinkIds, isCurrency]);

  return (
    <Box sx={{ pt: 2 }} id={item.linkId}>
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
          <Typography sx={{ width: '120px', pl: 1 }} data-testid='inputSum'>
            {formatCurrency(sum || 0)}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default InputGroup;
