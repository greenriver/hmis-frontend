import { Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';

const HorizontalGroup = ({
  item,
  renderChildItem,
}: GroupItemComponentProps & { horizontal?: boolean }) => {
  const manyChildren = (item.item || []).length > 2;
  const columnGap = manyChildren ? 2 : 4;
  const rowGap = manyChildren ? 1 : 2;

  return (
    <Grid item xs>
      {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
      <Grid
        container
        direction='row'
        columnGap={columnGap}
        rowGap={rowGap}
        alignItems='end'
      >
        {renderChildItem &&
          item.item?.map((childItem) => renderChildItem(childItem))}
      </Grid>
    </Grid>
  );
};

export default HorizontalGroup;
