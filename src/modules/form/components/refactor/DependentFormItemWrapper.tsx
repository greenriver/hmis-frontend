import React, { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from './useFormDefinitionHandlers';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
  item: FormItem;
  children: (isDisabled: boolean) => ReactNode;
}

const DependentFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
}) => {
  const { disabledDependencyMap, isItemDisabled } = handlers;

  // Listen for dependent field value changes
  useWatch({
    control: handlers.methods.control,
    name: disabledDependencyMap[item.linkId].map(getSafeLinkId),
  });

  return <>{children(isItemDisabled(item))}</>;
};

export default DependentFormItemWrapper;
