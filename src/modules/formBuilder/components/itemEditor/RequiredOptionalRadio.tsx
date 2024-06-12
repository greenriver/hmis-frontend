import { useCallback, useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { FormItemControl } from './types';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import { PickListOption } from '@/types/gqlTypes';

const options = [
  {
    code: 'required',
    label: 'Required',
  },
  {
    code: 'warnIfEmpty',
    label: 'Warn If Empty',
  },
  {
    code: 'optional',
    label: 'Optional',
  },
  {
    code: 'readOnly',
    label: 'Read-Only',
  },
];

interface Props {
  control: FormItemControl;
}

const RequiredOptionalRadio: React.FC<Props> = ({ control }) => {
  const { field: requiredField } = useController({
    name: 'required',
    control,
    defaultValue: false,
  });
  const { field: warnIfEmptyField } = useController({
    name: 'warnIfEmpty',
    control,
    defaultValue: false,
  });
  const { field: readOnlyField } = useController({
    name: 'readOnly',
    control,
    defaultValue: false,
  });

  const [required, warnIfEmpty, readOnly] = useWatch({
    control,
    name: ['required', 'warnIfEmpty', 'readOnly'],
  });

  const radioValue = useMemo(() => {
    if (required) {
      return 'required';
    } else if (warnIfEmpty) {
      return 'warnIfEmpty';
    } else if (readOnly) {
      return 'readOnly';
    } else {
      return 'optional';
    }
  }, [readOnly, required, warnIfEmpty]);

  const handleChange = useCallback(
    (option?: PickListOption | null) => {
      if (!option) return;

      if (option.code === 'required') {
        requiredField.onChange(true);
        warnIfEmptyField.onChange(false);
        readOnlyField.onChange(false);
      } else if (option.code === 'warnIfEmpty') {
        requiredField.onChange(false);
        warnIfEmptyField.onChange(true);
        readOnlyField.onChange(false);
      } else if (option.code === 'readOnly') {
        requiredField.onChange(false);
        warnIfEmptyField.onChange(false);
        readOnlyField.onChange(true);
      } else if (option.code === 'optional') {
        requiredField.onChange(false);
        warnIfEmptyField.onChange(false);
        readOnlyField.onChange(false);
      }
    },
    [readOnlyField, requiredField, warnIfEmptyField]
  );

  return (
    <RadioGroupInput
      options={options}
      label='Response Validation'
      value={options.find((o) => o.code === radioValue)}
      onChange={handleChange}
      labelSx={{ typography: 'body2', color: 'text.secondary', pt: 1 }}
      helperText={
        <>
          <b>Required</b>: Users cannot submit the form without providing an
          answer to this question
          <br />
          <b>Warn If Empty</b>: Users can skip this question, but will be shown
          a warning upon submission
          <br />
          <b>Optional</b>: Users can skip this question
          <br />
          <b>Read-Only</b>: Users cannot interact with this question
        </>
      }
    />
  );
};

export default RequiredOptionalRadio;
