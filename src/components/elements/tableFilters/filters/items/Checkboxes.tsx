import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';

import { TableFilterItemSelectorProps } from '../FilterItem';

const TableFilterItemCheckboxes: React.FC<
  Omit<TableFilterItemSelectorProps, 'variant'>
> = ({ options, value, onChange }) => {
  return (
    <>
      {options.map((option) => (
        <FormControlLabel
          label={option.label || option.value}
          control={
            <Checkbox
              size='small'
              onChange={(e, val) => {
                if (Array.isArray(value)) {
                  onChange(
                    val
                      ? [...value, option.value]
                      : value.filter((v) => v !== option.value)
                  );
                } else {
                  onChange(option.value);
                }
              }}
              checked={
                Array.isArray(value)
                  ? value.includes(option.value)
                  : option.value === value
              }
            />
          }
        />
      ))}
    </>
  );
};

export default TableFilterItemCheckboxes;
