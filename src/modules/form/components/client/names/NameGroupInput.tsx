import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { filter } from 'lodash-es';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { DynamicInputCommonProps } from '../../../types';

import NameInput from './NameInput';
import { NameInputType } from './types';

import { PartialPick } from '@/utils/typeUtil';

const generateNewName = (primary = false) => ({
  primary,
  _key: v4(),
});

interface Props extends DynamicInputCommonProps {
  value: NameInputType[];
  onChange: (value: NameInputType[]) => void;
}

const NameGroupInput = ({ id, value, onChange }: Props) => {
  console.log('all names:', JSON.stringify(value));
  const handleAddName = useCallback(() => {
    onChange([...value, generateNewName()]);
  }, [onChange, value]);

  return (
    <Stack id={id} gap={2}>
      {value.map((nameValue, idx) => {
        return (
          <NameInput
            key={nameValue._key || nameValue.id || idx}
            value={nameValue}
            onChange={(val) => {
              const copied = [...value];
              copied[idx] = val;
              onChange(copied);
            }}
            onRemove={
              nameValue.primary
                ? undefined
                : () => onChange(filter(value, (_o, index) => index !== idx))
            }
            radioElement={
              <FormControlLabel
                checked={nameValue.primary || false}
                control={<Radio />}
                label={
                  <Typography variant='body2'>Client's Primary Name</Typography>
                }
                onChange={(_event, checked) => {
                  console.log(checked);
                  onChange(
                    value.map((val, i) =>
                      i == idx
                        ? { ...val, primary: true }
                        : { ...val, primary: false }
                    )
                  );
                }}
              />
            }
          />
        );
      })}
      <Button
        onClick={handleAddName}
        color='secondary'
        variant='outlined'
        sx={{ width: 'fit-content', px: 4, mt: 2 }}
        startIcon={<AddIcon />}
      >
        Add name
      </Button>
    </Stack>
  );
};

const NameGroupWrapper = ({ value, ...props }: PartialPick<Props, 'value'>) => (
  <NameGroupInput {...props} value={value || [generateNewName(true)]} />
);

export default NameGroupWrapper;
