import React, { ReactNode, useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { FormValues } from '../../types';
import { hasMeaningfulValue } from '../../util/formUtil';
import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from './useFormDefinitionHandlers';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
  item: FormItem;
  children: (values: FormValues) => ReactNode;
}

const AutofillFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
}) => {
  const { autofillInvertedDependencyMap, getAutofillValueForField } = handlers;

  // Listen for dependent field value changes
  useWatch({
    control: handlers.methods.control,
    name: autofillInvertedDependencyMap[item.linkId].map(getSafeLinkId),
  });

  const autofillValue = getAutofillValueForField(item);

  useEffect(() => {
    const linkId = getSafeLinkId(item.linkId);
    const currentValue = handlers.methods.getValues()[linkId];
    if (hasMeaningfulValue(currentValue)) return;

    handlers.methods.setValue(linkId, autofillValue);
  }, [autofillValue, item, handlers.methods]);

  return <>{children({})}</>;
};

export default AutofillFormItemWrapper;
