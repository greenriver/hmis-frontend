import { isEqual } from 'lodash-es';
import React, { ReactNode, useEffect } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

import { useDynamicFormAutofill } from '@/modules/form/hooks/rhf/useDynamicFormAutofill';
import { FormItem } from '@/types/gqlTypes';

export interface Props {
  item: FormItem;
  children: (value: any) => ReactNode;
}

/**
 * A wrapper component that manages automatic field value population based on dependencies.
 *
 * This component handles the auto-population of form fields based on the values of other fields.
 * It watches for changes in dependent fields and updates the wrapped field's value accordingly.
 * The autofill behavior is skipped if the field has been manually edited by the user.
 *
 */
const AutofillFormItemWrapper: React.FC<Props> = ({ item, children }) => {
  const { linkId } = item;
  const autofillValue = useDynamicFormAutofill(item);
  const { setValue, getValues, control } = useFormContext();

  // Listen to see if this field has been edited by the user
  const { dirtyFields } = useFormState({ control: control, name: linkId });
  const isDirty = !!dirtyFields[linkId];

  useEffect(() => {
    // Don't autofill this field if it's been edited (i.e. is dirty)
    // for example, we automatically set the radio choice for Income Source to true if any of the income fields are non-zero
    if (isDirty) return;
    if (!autofillValue) return;

    // Don't autofill if the value is already set
    if (isEqual(autofillValue.value, getValues(linkId))) return;

    setValue(linkId, autofillValue.value, { shouldDirty: false });
  }, [autofillValue, linkId, getValues, setValue, isDirty]);

  return <>{children(autofillValue?.value)}</>;
};

export default AutofillFormItemWrapper;
