import { isEqual } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { useDynamicFieldAutofillValue } from '@/modules/form/hooks/rhf/useDynamicFieldAutofillValue';
import { FormItem, ItemType } from '@/types/gqlTypes';

export const useDynamicFieldAutofillSync = (item: FormItem) => {
  const { linkId } = item;
  const autofillValue = useDynamicFieldAutofillValue(item);
  const { setValue, getValues, control } = useFormContext();

  // Listen to see if this field has been edited by the user
  const { dirtyFields } = useFormState({ control: control, name: linkId });
  const isDirty = !!dirtyFields[linkId];
  const userEditable = item.type !== ItemType.Display;

  useEffect(() => {
    // Don't autofill this field if it's been edited (i.e. is dirty)
    // for example, we automatically set the radio choice for Income Source to true if any of the income fields are non-zero
    if (isDirty && userEditable) return;
    if (!autofillValue) return;

    // Don't autofill if the value is already set
    if (isEqual(autofillValue.value, getValues(linkId))) return;

    setValue(linkId, autofillValue.value, { shouldDirty: false });
  }, [autofillValue, linkId, getValues, setValue, isDirty, userEditable]);

  return autofillValue;
};
