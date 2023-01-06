import { Box, Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React from 'react';

import { NavItem } from '../SideNavMenu';

import { SideNavMenuMenuItemBase as ItemBase } from './ItemBase';
import Page from './Page';

export type SideNavMenuMenuItemTopicProps = {
  item: NavItem;
  selected?: string | undefined | null;
};

const Topic: React.FC<SideNavMenuMenuItemTopicProps> = ({ item, selected }) => {
  return (
    <ItemBase
      item={item}
      selected={selected}
      collapsible
      renderTitle={(title) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant='inherit' sx={{ px: 2 }}>
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

export default Topic;
