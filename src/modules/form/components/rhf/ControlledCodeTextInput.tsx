import { FieldValues } from 'react-hook-form';

import ControlledTextInput, {
  ControlledTextInputProps,
} from './ControlledTextInput';

const ControlledCodeTextInput = <T extends FieldValues = FieldValues>({
  InputProps,
  minRows = 6,
  multiline = true,
  ...props
}: ControlledTextInputProps<T>) => (
  <ControlledTextInput<T>
    {...props}
    multiline={multiline}
    minRows={minRows}
    InputProps={{
      ...InputProps,
      sx: {
        backgroundColor: 'grayscale.50',
        alignItems: 'flex-start',
        '& input, & textarea': {
          fontFamily: 'monospace',
          fontSize: 'small',
        },
      },
    }}
  />
);

export default ControlledCodeTextInput;
