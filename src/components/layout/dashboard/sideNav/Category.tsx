import { Box, Divider, Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React from 'react';

import { NavItem } from '../SideNavMenu';

import { SideNavMenuMenuItemBase as ItemBase } from './ItemBase';
import Page from './Page';
import Topic from './Topic';

export type SideNavMenuMenuItemCategoryProps = {
  item: NavItem;
  selected?: string | undefined | null;
  first: boolean;
};

const Category: React.FC<SideNavMenuMenuItemCategoryProps> = ({
  item,
  selected,
  first,
}) => {
  return (
    <ItemBase
      item={item}
      selected={selected}
      showIcon
      renderTitle={(title) => (
        <Box sx={{ width: '100%' }}>
          {!first && <Divider />}
          <Typography variant='h6' sx={{ pt: first ? 0 : 2, px: 2 }}>
            {title}
          </Typography>
        </Box>
      )}
      renderChild={(item, selected) => {
        let ChildComponent = Topic;
        if (isEmpty(item.items)) ChildComponent = Page;

        return <ChildComponent key={item.id} item={item} selected={selected} />;
      }}
    />
  );
};

export default Category;
