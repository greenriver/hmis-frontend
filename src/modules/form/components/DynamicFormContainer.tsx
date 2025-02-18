import React, { ReactNode } from 'react';

import { formAutoCompleteOff } from '@/modules/form/util/formUtil';

interface Props {
  children: ReactNode;
}

const noOpSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();
const DynamicFormContainer: React.FC<Props> = (props) => {
  return (
    <form onSubmit={noOpSubmit} autoComplete={formAutoCompleteOff} {...props} />
  );
};

export default DynamicFormContainer;
