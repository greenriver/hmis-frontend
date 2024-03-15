import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const phoneMaskOptions = {
  mask: [
    {
      mask: '(000) 000-0000',
    },
    {
      mask: '{+}0` (000) 000-0000',
    },
    {
      mask: '{+}00` (000) 000-0000',
    },
  ],
};

const TextMaskCustom = forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={phoneMaskOptions.mask}
        overwrite='shift'
        inputRef={ref}
        onAccept={(value, mask) => {
          const numericValue = mask.unmaskedValue.replace(/\D/gi, '');
          const hasCountryCode = numericValue.length > 10;
          return onChange({
            target: {
              name: props.name,
              value: hasCountryCode ? mask.unmaskedValue : numericValue,
            },
          });
        }}
      />
    );
  }
);

const PhoneInput = ({ InputProps, ...props }: TextInputProps) => {
  return (
    <TextInput
      InputProps={{ inputComponent: TextMaskCustom as any, ...InputProps }}
      {...props}
    />
  );
};

export default PhoneInput;
