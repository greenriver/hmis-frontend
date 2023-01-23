import { Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';

import ItemBase, { ItemBaseProps } from './ItemBase';
import Topic from './ItemTopic';

interface Props extends ItemBaseProps {
  first: boolean;
}

/**
 * A menu item that represents a category (like 'Administrative')
 */
const ItemCategory = ({ item, first }: Props) => {
  return (
    <ItemBase
      item={item}
      renderTitle={(title) => (
        // <Box sx={{ width: '100%' }}>
        //   {!first && <Divider />}
        <Typography variant='h6' sx={{ pt: first ? 0 : 2, px: 2 }}>
          {title}
        </Typography>
        // </Box>
      )}
      renderChild={(item) => {
        let ChildComponent = Topic;
        if (isEmpty(item.items)) ChildComponent = ItemBase;

        return (
          <ChildComponent key={item.id} item={item} renderChild={() => null} />
        );
      }}
    />
  );
};

export default ItemCategory;
