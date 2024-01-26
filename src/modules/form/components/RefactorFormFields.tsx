import React from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { PickListArgs } from '../types';

import RefactorFormField from './RefactorFormField';

export interface Props {
  handlers: FormDefinitionHandlers;
  clientId?: string;
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  locked?: boolean;
  bulk?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
}

const RefactorFormFields: React.FC<Props> = ({ handlers, ...props }) => {
  const definition = handlers.definition;

  return (
    <>
      {definition.item.map((item) => (
        <RefactorFormField
          key={item.linkId}
          handlers={handlers}
          nestingLevel={0}
          item={item}
          {...props}
        />
      ))}
    </>
  );
};

export default RefactorFormFields;
