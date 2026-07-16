import { ChangeEvent, useCallback } from 'react';
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from 'react-hook-form';

import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';
import { RhfRules } from '@/modules/form/types';

export interface ControlledTextInputProps<
  T extends FieldValues = FieldValues,
> extends Omit<TextInputProps, 'value' | 'onChange'> {
  // Path<T> gives callers type checking for nested RHF paths.
  name: Path<T>;
  control?: Control<T>; // Optional when using FormProvider
  rules?: RhfRules;
}

// React-Hook-Form wrapper around TextInput
const ControlledTextInput = <T extends FieldValues = FieldValues>({
  name,
  control,
  onBlur,
  rules,
  required,
  ...props
}: ControlledTextInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    shouldUnregister: true,
    rules: {
      required: required ? 'This field is required' : false,
      ...rules,
    } as RegisterOptions<T, Path<T>>,
  });

  const { onChange: formOnChange, onBlur: formOnBlur } = field;
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(event); // call custom onBlur
      formOnBlur(); // notify form
    },
    [formOnBlur, onBlur]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const value = event.target.value;
      if (props.type === 'number') {
        // if this is a number input, convert the value to a number
        formOnChange(value === '' ? '' : Number(value));
      } else {
        formOnChange(value);
      }
    },
    [formOnChange, props.type]
  );

  return (
    <TextInput
      onChange={handleChange}
      onBlur={handleBlur} // notify when input is touched/blur
      value={field.value} // input value
      name={field.name} // send down the input name
      inputRef={field.ref} // send input ref, so we can focus on input when error appear
      {...props}
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default ControlledTextInput;
