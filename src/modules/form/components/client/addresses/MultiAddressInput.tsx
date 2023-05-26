import { pullAt } from 'lodash-es';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { DynamicInputCommonProps } from '../../../types';
import RepeatedInputContainer from '../RepeatedInputContainer';
import { AddressInputType } from '../types';

import AddressInput from './AddressInput';

import RelativeDateDisplay from '@/modules/hmis/components/RelativeDateDisplay';
import apolloClient from '@/providers/apolloClient';
import { ClientAddressFieldsFragmentDoc } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

const generateNewAddress = () => ({
  _key: v4(),
});

interface Props extends DynamicInputCommonProps {
  value: AddressInputType[];
  onChange: (value: AddressInputType[]) => void;
}

const MultiAddressInput = ({ id, value, onChange }: Props) => {
  const handleAddName = useCallback(() => {
    onChange([...value, generateNewAddress()]);
  }, [onChange, value]);

  const renderMetadata = useCallback((addrValue: AddressInputType) => {
    if (!addrValue.id) return null;
    const record = apolloClient.readFragment({
      id: `ClientAddress:${addrValue.id}`,
      fragment: ClientAddressFieldsFragmentDoc,
      fragmentName: 'ClientAddressFields',
    });
    if (!record) return null;
    return (
      <RelativeDateDisplay
        dateString={record.dateUpdated}
        prefixVerb='Last updated'
        TypographyProps={{
          variant: 'body2',
          fontStyle: 'italic',
          color: 'text.disabled',
          fontSize: 'inherit',
        }}
      />
    );
  }, []);

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
  <MultiAddressInput {...props} value={value || [generateNewAddress()]} />
);

export default MultiAddressInputWrapper;
