import React from 'react';
import { FormItem } from '@/types/gqlTypes';

export const FormTreeContext = React.createContext<{
  openFormItemEditor: (item: FormItem) => void;
  expandItem: (itemId: string) => void;
  // collapseItem: (itemId: string) => void;
}>({
  openFormItemEditor: () => {},
  expandItem: () => {},
  // collapseItem: () => {},
});
