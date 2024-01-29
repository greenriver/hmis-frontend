import React, { ReactNode, useEffect } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import {
  FormDefinitionHandlers,
  getSafeLinkId,
} from '../hooks/useFormDefinitionHandlers';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  handlers: FormDefinitionHandlers;
  item: FormItem;
  children: (value: any) => ReactNode;
  getDependentLinkIds?: (item: FormItem) => string[];
}

const AutofillFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
  getDependentLinkIds,
}) => {
  const { autofillInvertedDependencyMap, getAutofillValueForField } = handlers;
  const name = (
    getDependentLinkIds
      ? getDependentLinkIds(item)
      : autofillInvertedDependencyMap[item.linkId]
  )?.map(getSafeLinkId);

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
    // Dont autofill if this is already the same value
    if (
      autofillValue === handlers.methods.getValues()[getSafeLinkId(item.linkId)]
    )
      return;

    handlers.methods.setValue(getSafeLinkId(linkId), autofillValue, {
      shouldDirty: false,
    });
  }, [autofillValue, item, handlers.methods, isDirty]);

  return <>{children(autofillValue)}</>;
};

export default AutofillFormItemWrapper;
