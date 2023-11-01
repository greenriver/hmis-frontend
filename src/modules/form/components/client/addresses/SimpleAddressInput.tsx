import { useEffect } from 'react';

import { DynamicInputCommonProps } from '../../../types';
import { AddressInputType } from '../types';
import { createInitialValue } from '../util';

import AddressInput from './AddressInput';

import SimpleInputContainer from '@/modules/form/components/client/SimpleInputContainer';

const initialValue: AddressInputType[] = [];

interface Props extends DynamicInputCommonProps {
  value?: AddressInputType[];
  onChange: (value: AddressInputType[]) => void;
}

// similar to MultiAddressInput, we expect value to have only one member so we skip add/del item. If no member exists,
// we create new object via onChange
const SimpleAddressInput: React.FC<Props> = ({
  id,
  value,
  onChange,
  label,
}) => {
  const values = value ? value : initialValue;

  useEffect(() => {
    if (values.length == 0) {
      onChange([createInitialValue()]);
    }
  }, [values, onChange]);

  return (
    <SimpleInputContainer
      id={id}
      values={values}
      valueKey={(addrValue) => addrValue._key || addrValue.id || ''}
      renderChild={(addrValue, idx) => {
        return (
          <AddressInput
            variant='minimal'
            value={addrValue}
            onChange={(val) => {
              const copied = [...values];
              copied[idx] = val;
              onChange(copied);
            }}
          />
        );
      }}
      title={label}
    />
  );
};

export default SimpleAddressInput;
