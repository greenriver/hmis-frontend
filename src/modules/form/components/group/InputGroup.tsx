import { Box, Grid, Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import { ReactNode, useCallback, useMemo } from 'react';

import { GroupItemComponentProps } from '../../types';
import { maxWidthAtNestingLevel } from '../../util/formUtil';

import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

const InputGroup = ({
  item,
  values,
  renderChildItem,
  nestingLevel,
  viewOnly = false,
  rowSx,
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
    () => ({ horizontal: isNumeric || viewOnly ? true : undefined }),
    [isNumeric, viewOnly]
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
            ...rowSx,
          }}
        >
          {children}
        </Box>
      ),
    [rowSx]
  );

  const wrappedChildren = useMemo(() => {
    const maxWidth = isNumeric
      ? maxWidthAtNestingLevel(nestingLevel + 1)
      : undefined;
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
          maxWidth: viewOnly ? undefined : maxWidth,
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
    viewOnly,
    childRenderFunc,
  ]);

  const maxWidth = maxWidthAtNestingLevel(nestingLevel + 1);
  let label = item.text;
  if (viewOnly && !isNil(item.readonlyText)) label = item.readonlyText;
  return (
    <Box id={item.linkId}>
      {label && (
        <Typography
          sx={{ mt: 1, mb: 2 }}
          variant={viewOnly ? 'body2' : undefined}
          fontWeight={viewOnly ? 600 : undefined}
        >
          {label}
        </Typography>
      )}
      {wrappedChildren}
      {isNumeric && summaryItem && (
        <Stack
          justifyContent='space-between'
          direction='row'
          sx={{
            py: 2,
            pl: 1,
            mb: 2,
            border: (theme) => `1px solid ${theme.palette.grey[200]}`,
            maxWidth: viewOnly ? undefined : maxWidth,
            textAlign: viewOnly ? 'right' : undefined,
            ...rowSx,
          }}
        >
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {summaryItem.text || 'Total'}
          </Typography>
          <Typography
            variant='body2'
            sx={{ width: '120px', fontWeight: 600 }}
            data-testid='inputSum'
          >
            {childItemType === ItemType.Currency
              ? formatCurrency(values[summaryItem.linkId] || 0)
              : values[summaryItem.linkId] || 0}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

InputGroup.displayName = 'InputGroup';

export default InputGroup;
