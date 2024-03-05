import { Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';

const HorizontalGroup = ({
  item,
  renderChildItem,
  viewOnly,
}: GroupItemComponentProps & { horizontal?: boolean }) => {
  const columnGap = viewOnly ? 4 : 2; // more spacing between in read-only view
  const rowGap = 2;

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
