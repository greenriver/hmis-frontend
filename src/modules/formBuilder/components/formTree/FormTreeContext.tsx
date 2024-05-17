import React from 'react';
import { FormItem } from '@/types/gqlTypes';

export const FormTreeContext = React.createContext<{
  onEditButtonClicked: (item: FormItem) => void;
}>({ onEditButtonClicked: () => {} });
