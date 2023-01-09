import { Box, Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';

import ItemBase, { ItemBaseProps } from './ItemBase';

type Props = ItemBaseProps;

/**
 * A menu item with collapsible children items
 */
const ItemTopic = ({ item }: Props) => {
  return (
    <ItemBase
      item={item}
      collapsible
      renderTitle={(title) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant='inherit' sx={{ px: 2 }}>
            {title}
          </Typography>
        </Box>
      )}
      renderChild={(item) => {
        let ChildComponent = ItemTopic;
        if (isEmpty(item.items)) ChildComponent = ItemBase;

        return <ChildComponent key={item.id} item={item} />;
      }}
    />
  );
};

export default ItemTopic;
