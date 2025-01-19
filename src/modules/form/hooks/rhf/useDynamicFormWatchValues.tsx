import { useMemo } from 'react';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';

export const useDynamicFormWatchValues = (watchFields: string[]) => {
  const { control } = useFormContext();
  const valueArray = useWatch({
    control,
    name: watchFields,
  });

  return useMemo<FieldValues>(
    () =>
      watchFields.reduce(
        (acc, fieldName, index) => ({
          ...acc,
          [fieldName]: valueArray[index],
        }),
        {}
      ),
    [watchFields, valueArray]
  );
};
