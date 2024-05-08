import React, { ReactNode } from 'react';

import { formAutoCompleteOff } from '@/modules/form/util/formUtil';

export interface DynamicFormContainerProps {
  children: ReactNode;
}

const DynamicFormContainer = ({ children }: DynamicFormContainerProps) => {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      autoComplete={formAutoCompleteOff}
    >
      {children}
    </form>
  );
};

export default DynamicFormContainer;
