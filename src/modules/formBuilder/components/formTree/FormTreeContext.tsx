import React from 'react';
import { ItemMap } from '@/modules/form/types';
import { FormItem } from '@/types/gqlTypes';

export const FormTreeContext = React.createContext<{
  openFormItemEditor: (item: FormItem) => void;
  expandItem: (itemId: string) => void;
  collapseItem: (itemId: string) => void;
  itemMap: ItemMap;
}>({
  openFormItemEditor: () => {},
  expandItem: () => {},
  collapseItem: () => {},
  itemMap: {},
});
