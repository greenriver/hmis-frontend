import React from 'react';
import { FormItemForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';

export const FormTreeContext = React.createContext<{
  onEditButtonClicked: (item: FormItemForTree) => void;
}>({ onEditButtonClicked: () => {} });
