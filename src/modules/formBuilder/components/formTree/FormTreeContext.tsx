import React from 'react';
import { FormItemForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';

export const FormTreeContext = React.createContext<{
  onEditButtonClicked: (item: FormItemForTree) => void;
  onReorder: (item: FormItemForTree, direction: 'up' | 'down') => void;
}>({
  onEditButtonClicked: () => {},
  onReorder: () => {},
});
