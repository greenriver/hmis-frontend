import { useCallback } from 'react';
import { Control, useController } from 'react-hook-form';
import TextInput, { TextInputProps } from './TextInput';
import { RhfRules } from '@/modules/form/types';

interface RhfTextInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  numeric?: boolean;
}

const RhfTextInput: React.FC<RhfTextInputProps> = ({
  name,
  control,
  onBlur,
  rules,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    shouldUnregister: true,
    rules: {
      required: props.required ? 'This field is required' : false,
      pattern: props.type === 'number' ? /^(0|[1-9]\d*)(\.\d+)?$/ : undefined,
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
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default RhfTextInput;
