import { useEffect } from 'react';

import TextInput, { TextInputProps } from './TextInput';
import useDebouncedState from '@/hooks/useDebouncedState';

interface Props extends Omit<TextInputProps, 'onChange' | 'value'> {
  value: string;
  debounceDelay?: number;
  onChange: (value: string) => void;
}

const DebouncedTextInput: React.FC<Props> = ({
  debounceDelay,
  value,
  onChange,
  ...props
}) => {
  const [currValue, setCurrValue, debouncedValue] = useDebouncedState<string>(
    value,
    debounceDelay
  );

  useEffect(() => {
    if (debouncedValue !== undefined) {
      onChange(debouncedValue);
    }

    // don't depend on `onChange`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <TextInput
      value={currValue}
      onChange={(e) => setCurrValue(e.target.value)}
      {...props}
    />
  );
};

export default DebouncedTextInput;
