import { pullAt } from 'lodash-es';
import { useCallback } from 'react';

import { DynamicInputCommonProps } from '../../../types';
import RepeatedInputContainer from '../RepeatedInputContainer';
import { PhoneInputType } from '../types';
import { useRenderLastUpdated } from '../useRenderLastUpdated';
import { createInitialValue } from '../util';

import PhoneInput from './PhoneInputGroup';

import { ClientContactPointFieldsFragmentDoc } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

interface Props extends DynamicInputCommonProps {
  value: PhoneInputType[];
  onChange: (value: PhoneInputType[]) => void;
}

const MultiPhoneInput = ({ id, value, onChange, label }: Props) => {
  const handleAddName = useCallback(() => {
    onChange([...value, createInitialValue()]);
  }, [onChange, value]);

  const { renderMetadata } = useRenderLastUpdated(
    'ClientContactPoint',
    ClientContactPointFieldsFragmentDoc,
    'ClientContactPointFields'
  );

  return (
    <RepeatedInputContainer
      id={id}
      values={value}
      valueKey={(addrValue) => addrValue._key || addrValue.id || ''}
      renderChild={(addrValue, idx) => {
        return (
          <PhoneInput
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
      removeText='Delete phone'
      addText='Add phone'
      renderMetadata={renderMetadata}
    />
  );
};

const MultiPhoneInputWrapper = ({
  value,
  ...props
}: PartialPick<Props, 'value'>) => (
  <MultiPhoneInput {...props} value={value || []} />
);

export default MultiPhoneInputWrapper;
