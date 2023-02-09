import { Box, Grid, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback, useMemo } from 'react';

import { maxWidthAtNestingLevel } from '../DynamicField';
import { GroupItemComponentProps } from '../DynamicGroup';

import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

const InputGroup = ({
  item,
  values,
  renderChildItem,
  nestingLevel,
}: GroupItemComponentProps) => {
  const [childItems, summaryItem] = useMemo(() => {
    const childs: FormItem[] = (item.item || []).filter((i) => !i.hidden);
    let summary: FormItem | undefined;
    if (childs[childs.length - 1]?.type === ItemType.Display) {
      summary = childs.pop();
    }
    return [childs, summary];
  }, [item]);

  const childItemType = useMemo(() => childItems[0]?.type, [childItems]);

  const isNumeric = useMemo(
    () =>
      childItemType &&
      [ItemType.Currency, ItemType.Integer].includes(childItemType),
    [childItemType]
  );

  const childProps = useMemo(
    () => ({ horizontal: isNumeric ? true : undefined }),
    [isNumeric]
  );

  const childRenderFunc = useCallback(
    (item: FormItem, index: number) => (children: ReactNode) =>
      (
        <Box
          key={item.linkId}
          sx={{
            backgroundColor: (theme) =>
              index & 1 ? undefined : theme.palette.grey[100],
            pl: 1,
            pb: 0.5,
            pr: 0.5,
            ...(item.type === ItemType.String
              ? {
                  pt: 0.5,
                  label: {
                    width: '100%',
                  },
                }
              : undefined),
          }}
        >
          {children}
        </Box>
      ),
    []
  );

  const wrappedChildren = useMemo(() => {
    return (
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        columnSpacing={0}
        sx={{
          '& .MuiGrid-item': { pt: 0, maxWidth: '100%' },
          mt: 0,
          border: (theme) => `1px solid ${theme.palette.grey[200]}`,
          maxWidth: isNumeric
            ? maxWidthAtNestingLevel(nestingLevel + 1)
            : undefined,
        }}
      >
        {renderChildItem &&
          childItems &&
          childItems.map((childItem, index) =>
            renderChildItem(
              childItem,
              childProps,
              // pass render function so child gets wrapped in box.
              // can't wrap here because child might be hidden, in which case we shouldn't wrap it.
              childRenderFunc(childItem, index)
            )
          )}
      </Grid>
    );
  }, [
    renderChildItem,
    nestingLevel,
    isNumeric,
    childItems,
    childProps,
    childRenderFunc,
  ]);

  return (
    <Box id={item.linkId}>
      {item.text && <Typography sx={{ mb: 1 }}>{item.text}</Typography>}
      {wrappedChildren}
      {isNumeric && summaryItem && (
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
          <Typography>{summaryItem.text || 'Total'}</Typography>
          <Typography sx={{ width: '120px', pl: 1 }} data-testid='inputSum'>
            {childItemType === ItemType.Currency
              ? formatCurrency(values[summaryItem.linkId] || 0)
              : values[summaryItem.linkId] || 0}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default InputGroup;
