import { Grid, Paper, Stack, Typography } from '@mui/material';

import { ViewGroupItemComponentProps } from '../../../types';

const ViewCard = ({
  item,
  renderChildItem,
  anchor,
}: ViewGroupItemComponentProps & {
  anchor?: string;
}) => {
  return (
    <Grid id={anchor} item>
      <Paper
        sx={{
          py: 3,
          px: 2.5,
          pageBreakInside: 'avoid',
        }}
      >
        {/* Card title */}
        {item.text && (
          <Stack justifyContent='space-between' direction='row'>
            <Typography variant='h5' sx={{ mb: 2 }}>
              {item.text}
            </Typography>
          </Stack>
        )}

        {/* Dynamically render child items */}
        <Grid
          container
          direction='column'
          gap={2}
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
