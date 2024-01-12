import React, { ReactNode } from 'react';

import { formAutoCompleteOff } from '@/modules/form/util/formUtil';

export interface RefactorFormContainerProps {
  children: ReactNode;
}

const RefactorFormContainer = ({ children }: RefactorFormContainerProps) => {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      autoComplete={formAutoCompleteOff}
    >
      {children}
    </form>
  );
};

export default RefactorFormContainer;
