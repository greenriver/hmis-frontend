import React, { ReactNode, useEffect } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import { FormValues } from '../../types';
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
  const name = autofillInvertedDependencyMap[item.linkId].map(getSafeLinkId);

  // Listen for dependent field value changes
  useWatch({
    control: handlers.methods.control,
    name,
  });
  // Listen to see if this field is changed
  const { isDirty } = useFormState({
    control: handlers.methods.control,
    name: item.linkId,
  });

  const autofillValue = getAutofillValueForField(item);

  useEffect(() => {
    // Don't autofill this field if it's been edited (i.e. is dirty)
    if (isDirty) return;

    const linkId = getSafeLinkId(item.linkId);
    handlers.methods.setValue(getSafeLinkId(linkId), autofillValue, {
      shouldDirty: false,
    });
  }, [autofillValue, item, handlers.methods, isDirty]);

  return <>{children({})}</>;
};

export default AutofillFormItemWrapper;
