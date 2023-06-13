import { pullAt } from 'lodash-es';
import { useCallback } from 'react';

import { DynamicInputCommonProps } from '../../../types';
import RepeatedInputContainer from '../RepeatedInputContainer';
import { EmailInputType } from '../types';
import { useRenderLastUpdated } from '../useRenderLastUpdated';
import { createInitialValue } from '../util';

import EmailInput from './EmailInput';

import { ClientContactPointFieldsFragmentDoc } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

interface Props extends DynamicInputCommonProps {
  value: EmailInputType[];
  onChange: (value: EmailInputType[]) => void;
}

const MultiEmailInput = ({ id, value, onChange, label }: Props) => {
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
          <EmailInput
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
      removeText='Delete email'
      addText='Add email'
      renderMetadata={renderMetadata}
    />
  );
};

const MultiEmailInputWrapper = ({
  value,
  ...props
}: PartialPick<Props, 'value'>) => (
  <MultiEmailInput {...props} value={value || [createInitialValue()]} />
);

export default MultiEmailInputWrapper;
