import { isNil } from 'lodash-es';
import { useCallback } from 'react';

import RadioGroupInput, {
  Props as RadioGroupInputProps,
} from './RadioGroupInput';

import { PickListOption } from '@/types/gqlTypes';

const TRUE_OPT = { code: 'true', label: 'Yes' };
const FALSE_OPT = { code: 'false', label: 'No' };

type Props = { onChange: (val: boolean | null) => void } & Omit<
  RadioGroupInputProps,
  'options' | 'onChange'
>;

const YesNoRadio = ({ value, onChange, ...props }: Props) => {
  const toBoolean = useCallback((val?: PickListOption | null) => {
    if (isNil(val)) return null;
    if (val?.code === TRUE_OPT.code) return true;
    if (val?.code === FALSE_OPT.code) return false;
    return null;
  }, []);

  const fromBoolean = useCallback((val: boolean | null) => {
    if (isNil(val)) return null;
    if (val) return TRUE_OPT;
    return FALSE_OPT;
  }, []);

  const handleChange = useCallback(
    (val?: PickListOption | null) => {
      return onChange(toBoolean(val));
    },
    [onChange, toBoolean]
  );

  return (
    <RadioGroupInput
      value={fromBoolean(value)}
      onChange={handleChange}
      options={[TRUE_OPT, FALSE_OPT]}
      row
      clearable
      checkbox
      {...props}
    />
  );
};

export default YesNoRadio;
