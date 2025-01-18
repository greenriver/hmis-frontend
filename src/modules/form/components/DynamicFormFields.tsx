import React, { useCallback } from 'react';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import {
  ChangeType,
  ItemChangedFn,
  PickListArgs,
  SeveralItemsChangedFn,
} from '../types';
import DynamicFormField from './DynamicFormField';
import { ItemType } from '@/types/gqlTypes';

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

  // Handles changes to individual form items, converting values as needed
  const itemChanged: ItemChangedFn = useCallback(
    ({ linkId, value: baseValue, type }) => {
      const item = handlers.itemMap[linkId];
      let value = baseValue;
      // Convert string values to appropriate number types
      if (item) {
        if (item.type === ItemType.Integer) value = parseInt(value) || 0;
        if (item.type === ItemType.Currency) value = parseFloat(value) || 0;
      }
      handlers.methods.setValue(linkId, value, {
        shouldDirty: type === ChangeType.User,
      });
    },
    [handlers]
  );

  // Handles batch changes to multiple form items
  const severalItemsChanged: SeveralItemsChangedFn = useCallback(
    ({ values, type }) => {
      Object.entries(values).forEach(([linkId, value]) =>
        itemChanged({ linkId, value, type })
      );
    },
    [itemChanged]
  );

  return (
    <>
      {definition.item.map((item) => (
        <DynamicFormField
          key={item.linkId}
          handlers={handlers}
          nestingLevel={0}
          item={item}
          itemChanged={itemChanged}
          severalItemsChanged={severalItemsChanged}
          {...props}
        />
      ))}
    </>
  );
};

export default DynamicFormFields;
