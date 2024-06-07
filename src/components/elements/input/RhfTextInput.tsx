import { useCallback } from 'react';
import { Control, useController } from 'react-hook-form';
import TextInput, { TextInputProps } from './TextInput';
import { RhfRules } from '@/modules/form/types';

interface RhfTextInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
}
const RhfTextInput: React.FC<RhfTextInputProps> = ({
  name,
  control,
  onBlur,
  required,
  rules,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      // If field is marked as required, add a default rule and message
      required: required ? 'This field is required' : false,
      // Allow any additional rules, including overriding the 'required' rule/message
      ...rules,
    },
  });

  const wrappedOnBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(event); // call custom onBlur
      field.onBlur(); // notify form
    },
    [field, onBlur]
  );

  return (
    <TextInput
      onChange={field.onChange} // send value to hook form
      onBlur={wrappedOnBlur} // notify when input is touched/blur
      value={field.value} // input value
      name={field.name} // send down the input name
      inputRef={field.ref} // send input ref, so we can focus on input when error appear
      {...props}
      required={required}
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default RhfTextInput;
