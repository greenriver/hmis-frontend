import { useEffect } from 'react';

import { DynamicInputCommonProps } from '../../../types';
import { AddressInputType } from '../types';
import { useRenderLastUpdated } from '../useRenderLastUpdated';
import { createInitialValue } from '../util';

import AddressInput from './AddressInput';

import SingleInputContainer from '@/modules/form/components/client/SingleInputContainer';
import { ClientAddressFieldsFragmentDoc } from '@/types/gqlTypes';

interface Props extends DynamicInputCommonProps {
  value?: AddressInputType[];
  onChange: (value: AddressInputType[]) => void;
}

const initialValue: AddressInputType[] = [];
const SingleAddressInput: React.FC<Props> = ({
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

  const { renderMetadata } = useRenderLastUpdated(
    'ClientAddress',
    ClientAddressFieldsFragmentDoc,
    'ClientAddressFields'
  );

  return (
    <SingleInputContainer
      id={id}
      values={values}
      valueKey={(addrValue) => addrValue._key || addrValue.id || ''}
      renderChild={(addrValue, idx) => {
        return (
          <AddressInput
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
      renderMetadata={renderMetadata}
    />
  );
};

export default SingleAddressInput;
