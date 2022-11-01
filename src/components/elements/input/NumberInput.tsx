import TextInput, { TextInputProps } from './TextInput';

const NumberInput = ({ inputProps, min, max, ...props }: TextInputProps) => {
  return (
    <TextInput
      type='number'
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
        min,
        max,
        ...inputProps,
      }}
      {...props}
    />
  );
};

export default NumberInput;
