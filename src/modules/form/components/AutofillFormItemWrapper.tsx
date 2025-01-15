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
}

/**
 * A wrapper component that manages automatic field value population based on dependencies.
 *
 * This component handles the auto-population of form fields based on the values of other fields.
 * It watches for changes in dependent fields and updates the wrapped field's value accordingly.
 * The autofill behavior is skipped if the field has been manually edited by the user.
 *
 */
const AutofillFormItemWrapper: React.FC<Props> = ({
  handlers,
  item,
  children,
}) => {
  const linkId = getSafeLinkId(item.linkId);
  // dependentLinkIds are referenced from the 'autofill_when' property of item
  // example:
  //   link_id: item.id,
  //   autofill_values: [ { autofill_when: [{ question: dependentLinkIds[0] }] } ],
  const { autofillInvertedDependencyMap, getAutofillValueForField } = handlers;
  const dependentLinkIds =
    autofillInvertedDependencyMap[item.linkId]?.map(getSafeLinkId);

  const { setValue, getValues, control } = handlers.methods;

  // subscribe to changes in the dependent field values
  useWatch({ control: control, name: dependentLinkIds });
  // not memoized, we rely on useWatch to re-render here when dependentLinkIds change
  const autofillValue = getAutofillValueForField(item);

  // Listen to see if this field has been edited by the user
  const { dirtyFields } = useFormState({ control: control, name: linkId });
  const isDirty = !!dirtyFields[linkId];

  useEffect(() => {
    // Don't autofill this field if it's been edited (i.e. is dirty)
    // for example, we automatically set the radio choice for Income Source to true if any of the income fields are non-zero
    if (isDirty) return;

    // Don't autofill if this is already the same value
    if (autofillValue === getValues(linkId)) return;

    setValue(linkId, autofillValue, { shouldDirty: false });
  }, [autofillValue, linkId, getValues, setValue, isDirty]);

  return <>{children(autofillValue)}</>;
};

export default AutofillFormItemWrapper;
