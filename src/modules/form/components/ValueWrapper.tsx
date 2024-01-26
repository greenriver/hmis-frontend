import React, { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';

export type ValueWrapperProps = {
  name: string;
  handlers: FormDefinitionHandlers;
  children: (value: any) => ReactNode;
};

const ValueWrapper: React.FC<ValueWrapperProps> = ({
  handlers,
  name,
  children,
}) => {
  const value = useWatch({ control: handlers.methods.control, name });
  return children(value);
};

export default ValueWrapper;
