import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={[
          {
            mask: '(000) 000-0000',
          },
          {
            mask: '{+}0` (000) 000-0000',
          },
        ]}
        definitions={{
          '#': /[0-9]*/,
        }}
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite='shift'
      />
    );
  }
);

const PhoneInput = (props: TextInputProps) => {
  return (
    <TextInput
      InputProps={{ inputComponent: TextMaskCustom as any }}
      {...props}
    />
  );
};

export default PhoneInput;
