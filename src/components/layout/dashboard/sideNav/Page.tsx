import React from 'react';

import { NavItem } from '../SideNavMenu';

import { SideNavMenuMenuItemBase as ItemBase } from './ItemBase';

export type SideNavMenuMenuItemPageProps = {
  item: NavItem;
  selected?: string | undefined | null;
};

const Page: React.FC<SideNavMenuMenuItemPageProps> = ({ item, selected }) => {
  return (
    <ItemBase
      item={item}
      selected={selected}
      // renderTitle={renderTitle}
      renderChild={() => null}
    />
  );
};

export default Page;
