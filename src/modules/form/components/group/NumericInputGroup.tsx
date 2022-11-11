import { Box, Grid, Typography } from '@mui/material';
import { isNumber, pick, reduce } from 'lodash-es';
import { useMemo } from 'react';

import { GroupItemComponentProps } from './ItemGroup';

import NumberInput from '@/components/elements/input/NumberInput';
import { ItemType } from '@/types/gqlTypes';

const NumericInputGroup = ({
  item,
  values,
  renderChildItem,
}: GroupItemComponentProps) => {
  const direction = 'column'; // item.display?.direction ?? 'column';
  const isColumn = direction === 'column';

  const wrappedChildren = (
    <Grid
      container
      direction={direction}
      rowSpacing={isColumn ? 2 : 0}
      columnSpacing={isColumn ? 0 : 3}
      sx={{ '& .MuiGrid-item': { pt: 0 }, mt: 0 }}
    >
      {renderChildItem &&
        item.item?.map((childItem) => renderChildItem(childItem))}
    </Grid>
  );

  const childItemLinkIds: string[] = useMemo(
    () => item.item?.map((item) => item.linkId) || [],
    [item]
  );
  const sum = useMemo(() => {
    const relevant = pick(values, childItemLinkIds);
    return reduce(
      relevant,
      (sum, value) => {
        const val = parseInt(value);
        return isNumber(val) && !isNaN(val) ? sum + val : sum;
      },
      0
    );
  }, [values, childItemLinkIds]);

  return (
    <Box sx={{ py: 3 }}>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      {wrappedChildren}
      <Box sx={{ mt: 3 }}>
        <NumberInput
          horizontal
          value={sum || 0}
          disabled
          label='Total'
          currency={!!(item.item && item.item[0].type === ItemType.Currency)}
        />
      </Box>
    </Box>
  );
};

export default NumericInputGroup;
