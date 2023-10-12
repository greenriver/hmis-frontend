import { FormControlLabel, Radio, Typography } from '@mui/material';
import { pullAt } from 'lodash-es';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { DynamicInputCommonProps } from '../../../types';
import RepeatedInputContainer from '../RepeatedInputContainer';
import { NameInputType } from '../types';
import { useRenderLastUpdated } from '../useRenderLastUpdated';

import NameInput from './NameInput';

import { ClientNameObjectFieldsFragmentDoc } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

const generateNewName = (primary = false) => ({
  primary,
  _key: v4(),
});

interface Props extends DynamicInputCommonProps {
  value: NameInputType[];
  onChange: (value: NameInputType[]) => void;
}

const MultiNameInput = ({ id, value, onChange, label }: Props) => {
  const handleAddName = useCallback(() => {
    onChange([...value, generateNewName()]);
  }, [onChange, value]);

  const { renderMetadata } = useRenderLastUpdated(
    'ClientName',
    ClientNameObjectFieldsFragmentDoc,
    'ClientNameObjectFields'
  );

  return (
    <RepeatedInputContainer
      id={id}
      values={value}
      valueKey={(nameValue) => nameValue._key || nameValue.id || ''}
      renderChild={(nameValue, idx) => {
        return (
          <NameInput
            value={nameValue}
            onChange={(val) => {
              const copied = [...value];
              copied[idx] = val;
              onChange(copied);
            }}
            radioElement={
              <FormControlLabel
                checked={nameValue.primary || false}
                control={<Radio />}
                label={
                  <Typography variant='body2'>Client's Primary Name</Typography>
                }
                onChange={() =>
                  onChange(
                    value.map((val, i) =>
                      i == idx
                        ? { ...val, primary: true }
                        : { ...val, primary: false }
                    )
                  )
                }
              />
            }
          />
        );
      }}
      onClickAdd={handleAddName}
      removeAt={(val, idx) =>
        val.primary || value.length === 1
          ? undefined
          : () => {
              const copied = [...value];
              pullAt(copied, [idx]);
              onChange(copied);
            }
      }
      title={label}
      removeText='Delete Name'
      addText={value.length > 0 ? 'Add Another Name' : 'Add Name'}
      renderMetadata={renderMetadata}
    />
  );
};

const MultiNameInputWrapper = ({
  value,
  ...props
}: PartialPick<Props, 'value'>) => (
  <MultiNameInput {...props} value={value || [generateNewName(true)]} />
);

export default MultiNameInputWrapper;
