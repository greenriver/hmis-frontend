import { ChangeEvent, useCallback } from 'react';
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from 'react-hook-form';
import NumberInput from '@/components/elements/input/NumberInput';
import { TextInputProps } from '@/components/elements/input/TextInput';
import { RhfRules } from '@/modules/form/types';

export interface ControlledNumberInputProps<
  T extends FieldValues = FieldValues,
> extends Omit<TextInputProps, 'value' | 'onChange' | 'type'> {
  name: Path<T>;
  control?: Control<T>;
  rules?: RhfRules;
  currency?: boolean;
}

const ControlledNumberInput = <T extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  required,
  ...props
}: ControlledNumberInputProps<T>) => {
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

  const { onChange: formOnChange } = field;

  // NumberInput emits a string via synthetic change; store number|'' like ControlledTextInput type=number
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      formOnChange(value === '' ? '' : Number(value));
    },
    [formOnChange]
  );

  return (
    <NumberInput
      onChange={handleChange}
      value={field.value ?? ''}
      name={field.name}
      inputRef={field.ref}
      min={null} // by default NumberInput requires a min of 0, update to allow negative numbers by default here
      {...props}
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default ControlledNumberInput;
