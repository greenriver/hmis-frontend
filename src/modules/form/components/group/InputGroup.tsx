import { Box, Grid, Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import { ReactNode, useCallback, useId, useMemo } from 'react';

import { GroupItemComponentProps } from '../../types';

import { FIXED_WIDTH_X_LARGE } from '@/modules/form/util/formUtil';
import { formatCurrency } from '@/modules/hmis/hmisUtil';
import { FormItem, ItemType } from '@/types/gqlTypes';

const InputGroup = ({
  item,
  values,
  renderChildItem,
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
            ...(viewOnly
              ? {
                  '.MuiFormLabel-root .MuiTypography-root': {
                    textWrap: 'wrap',
                  },
                  '.MuiTypography-root.HmisForm-notCollectedText': {
                    textWrap: 'nowrap',
                  },
                }
              : {
                  // full width so entire label area is clickable for checkboxes
                  '.MuiFormControl-root': { width: '100%' },
                  '.MuiFormControlLabel-root': {
                    width: '100%',
                    '.MuiTypography-root': {
                      py: 0.3,
                    },
                  },
                }),
            ...(item.type === ItemType.String && !viewOnly
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
    [rowSx, viewOnly]
  );

  const groupLabelId = useId();

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
        }}
        role='group'
        aria-labelledby={groupLabelId}
      >
        {renderChildItem &&
          childItems &&
          childItems
            // Removed for now: hide "no" items in readonly view
            // .filter((item) => {
            //   if (!viewOnly) return true;

            //   const val = values[item.linkId];
            //   if (isNil(val)) return false;
            //   if (isDataNotCollected(val)) return false;
            //   if (isPickListOption(val) && val.code === 'NO') return false;
            //   return true;
            // })
            .map((childItem, index) =>
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
  }, [groupLabelId, renderChildItem, childItems, childProps, childRenderFunc]);

  let label = item.text;
  if (viewOnly && !isNil(item.readonlyText)) label = item.readonlyText;
  return (
    <Box id={item.linkId} sx={{ mb: 2, maxWidth: FIXED_WIDTH_X_LARGE }}>
      {label && (
        <Typography
          id={groupLabelId}
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
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            py: 2,
            pl: 1,
            border: (theme) => `1px solid ${theme.palette.grey[200]}`,
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
