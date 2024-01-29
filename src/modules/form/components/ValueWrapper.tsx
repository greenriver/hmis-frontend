import { first } from 'lodash-es';
import React, { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { ensureArray } from '@/utils/arrays';

export type ValueWrapperProps = {
  name: string | string[];
  handlers: FormDefinitionHandlers;
  children: (value: any) => ReactNode;
};

const ValueWrapper: React.FC<ValueWrapperProps> = ({
  handlers,
  name,
  children,
}) => {
  const value = useWatch({
    control: handlers.methods.control,
    name: ensureArray(name),
  });
  return children(first(value));
};

export default ValueWrapper;
