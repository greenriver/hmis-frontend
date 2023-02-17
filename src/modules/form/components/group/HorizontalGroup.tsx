import { Grid, Typography } from '@mui/material';

import { GroupItemComponentProps } from '../../types';

const HorizontalGroup = ({
  item,
  renderChildItem,
}: GroupItemComponentProps & { horizontal?: boolean }) => (
  <Grid item xs>
    {item.text && <Typography sx={{ mb: 2 }}>{item.text}</Typography>}
    <Grid container direction='row' columnGap={2} rowGap={1}>
      {renderChildItem &&
        item.item?.map((childItem) => renderChildItem(childItem))}
    </Grid>
  </Grid>
);

export default HorizontalGroup;
