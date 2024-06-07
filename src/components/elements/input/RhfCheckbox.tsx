import { Control, useController } from 'react-hook-form';
import LabeledCheckbox, {
  Props as LabeledCheckboxProps,
} from './LabeledCheckbox';
import { RhfRules } from '@/modules/form/types';

interface RhfCheckboxProps
  extends Omit<LabeledCheckboxProps, 'value' | 'onChange'> {
  name: string;
  control?: Control; // Optional when using FormProvider
  rules?: RhfRules;
}
const RhfCheckbox: React.FC<RhfCheckboxProps> = ({
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
    rules,
  });

  return (
    <LabeledCheckbox
      onChange={field.onChange} // send value to hook form
      onBlur={field.onBlur} // notify when input is touched/blur
      value={field.value} // input value
      name={field.name} // send down the input name
      inputRef={field.ref} // send input ref, so we can focus on input when error appear
      {...props}
      error={!!error || props.error}
      helperText={error?.message || props.helperText}
    />
  );
};

export default RhfCheckbox;
