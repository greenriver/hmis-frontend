import { Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';

import ItemBase, { ItemBaseProps } from './ItemBase';
import Topic from './ItemTopic';

interface Props<T> extends ItemBaseProps<T> {
  first: boolean;
}

/**
 * A menu item that represents a category (like 'Administrative')
 */
const ItemCategory = <T extends object>({ item, first }: Props<T>) => {
  const childItems = (item.items || []).filter((i) => !i.hide);

  // If all children in category are hidden, hide parent
  if (childItems.length === 0) return null;
  return (
    <ItemBase
      item={item}
      renderTitle={(title) => (
        // <Box sx={{ width: '100%' }}>
        //   {!first && <Divider />}
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ pt: first ? 0 : 2, px: 2, textTransform: 'uppercase' }}
        >
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
