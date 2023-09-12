import { Grid } from '@mui/material';

import { ViewGroupItemComponentProps } from '../../../types';

import { CommonCard } from '@/components/elements/CommonCard';
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
    <Grid id={anchor} item sx={{ width: '100%' }}>
      <CommonCard title={item.text} className='HmisForm-card'>
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
      </CommonCard>
    </Grid>
  );
};
export default ViewCard;
