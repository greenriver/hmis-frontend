import { pullAt } from 'lodash-es';
import { useCallback } from 'react';

import { DynamicInputCommonProps } from '../../../types';
import RepeatedInputContainer from '../RepeatedInputContainer';
import { AddressInputType } from '../types';
import { useRenderLastUpdated } from '../useRenderLastUpdated';
import { createInitialValue } from '../util';

import AddressInput from './AddressInput';

import { ClientAddressFieldsFragmentDoc } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

interface Props extends DynamicInputCommonProps {
  value: AddressInputType[];
  onChange: (value: AddressInputType[]) => void;
}

const MultiAddressInput = ({ id, value, onChange, label }: Props) => {
  const handleAddName = useCallback(() => {
    onChange([...value, createInitialValue()]);
  }, [onChange, value]);

  const { renderMetadata } = useRenderLastUpdated(
    'ClientAddress',
    ClientAddressFieldsFragmentDoc,
    'ClientAddressFields'
  );

  return (
    <RepeatedInputContainer
      id={id}
      values={value}
      valueKey={(addrValue) => addrValue._key || addrValue.id || ''}
      renderChild={(addrValue, idx) => {
        return (
          <AddressInput
            value={addrValue}
            onChange={(val) => {
              const copied = [...value];
              copied[idx] = val;
              onChange(copied);
            }}
          />
        );
      }}
      onClickAdd={handleAddName}
      removeAt={(val, idx) => () => {
        const copied = [...value];
        pullAt(copied, [idx]);
        onChange(copied);
      }}
      title={label}
      removeText='Delete address'
      addText='Add address'
      renderMetadata={renderMetadata}
    />
  );
};

const MultiAddressInputWrapper = ({
  value,
  ...props
}: PartialPick<Props, 'value'>) => (
  <MultiAddressInput {...props} value={value || []} />
);

export default MultiAddressInputWrapper;
