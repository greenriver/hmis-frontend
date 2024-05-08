import React from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { PickListArgs } from '../types';
import DynamicFormField from './DynamicFormField';

export interface Props {
  handlers: FormDefinitionHandlers;
  clientId?: string;
  horizontal?: boolean;
  warnIfEmpty?: boolean;
  visible?: boolean;
  pickListArgs?: PickListArgs;
}

const DynamicFormFields: React.FC<Props> = ({ handlers, ...props }) => {
  const definition = handlers.definition;

  return (
    <>
      {definition.item.map((item) => (
        <DynamicFormField
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

export default DynamicFormFields;
