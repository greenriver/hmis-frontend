import { Grid, Paper, Typography } from '@mui/material';

import { ViewGroupItemComponentProps } from '../../../types';

import { ItemType } from '@/types/gqlTypes';

const ViewCard = ({
  item,
  renderChildItem,
  anchor,
}: ViewGroupItemComponentProps & {
  anchor?: string;
}) => {
  const horizontal =
    (item.item || []).length < 4 &&
    !(item.item || []).find((item) => item.type === ItemType.Group);
  return (
    <Grid id={anchor} item>
      <Paper
        sx={{
          py: 2,
          px: 2.5,
          pageBreakInside: 'avoid',
        }}
      >
        <Typography variant='body1' sx={{ pb: 0.5, mb: 1.5 }}>
          {item.text}
        </Typography>

        {/* Dynamically render child items */}
        <Grid
          container
          direction={horizontal ? 'row' : 'column'}
          rowGap={2}
          columnGap={horizontal ? 6 : 2}
          sx={{
            '& .MuiGrid-item:first-of-type': !item.text ? { pt: 0 } : undefined,
            mt: 0,
          }}
        >
          {renderChildItem &&
            item.item?.map((childItem) => renderChildItem(childItem))}
        </Grid>
      </Paper>
    </Grid>
  );
};
export default ViewCard;
