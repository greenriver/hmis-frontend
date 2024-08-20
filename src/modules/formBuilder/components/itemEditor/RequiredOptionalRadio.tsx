import { useCallback, useMemo } from 'react';
import { UseFormSetValue, useWatch } from 'react-hook-form';
import { FormItemControl, FormItemState } from './types';
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
  setValue: UseFormSetValue<FormItemState>;
}

const RequiredOptionalRadio: React.FC<Props> = ({ control, setValue }) => {
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
        setValue('required', true);
        setValue('warnIfEmpty', false);
        setValue('readOnly', false);
      } else if (option.code === 'warnIfEmpty') {
        setValue('required', false);
        setValue('warnIfEmpty', true);
        setValue('readOnly', false);
      } else if (option.code === 'readOnly') {
        setValue('required', false);
        setValue('warnIfEmpty', false);
        setValue('readOnly', true);
      } else if (option.code === 'optional') {
        setValue('required', false);
        setValue('warnIfEmpty', false);
        setValue('readOnly', false);
      }
    },
    [setValue]
  );

  return (
    <RadioGroupInput
      options={options}
      label='Response Validation'
      value={options.find((o) => o.code === radioValue)}
      onChange={handleChange}
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
