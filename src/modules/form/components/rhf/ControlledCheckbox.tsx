import { Control, useController } from 'react-hook-form';
import LabeledCheckbox, {
  Props as LabeledCheckboxProps,
} from '@/components/elements/input/LabeledCheckbox';
import { RhfRules } from '@/modules/form/types';

interface ControlledCheckboxProps
  extends Omit<LabeledCheckboxProps, 'value' | 'onChange' | 'onBlur'> {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
  onChange?: (value: boolean) => void;
}

// React-Hook-Form wrapper around LabeledCheckbox
const ControlledCheckbox: React.FC<ControlledCheckboxProps> = ({
  name,
  control,
  rules,
  onChange,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <LabeledCheckbox
      onChange={(_event, value) => {
        field.onChange(_event, value); // send value to hook form
        if (onChange) onChange(value); // call onChange callback passed down from the parent, if provided
      }}
      onBlur={field.onBlur} // notify when input is touched/blur
      value={field.value || false} // input value
      name={field.name} // send down the input name
      inputRef={field.ref} // send input ref, so we can focus on input when error appear
      {...props}
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default ControlledCheckbox;
